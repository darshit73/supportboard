<?php

/*
 * ==========================================================
 * WHMCS APP
 * ==========================================================
 *
 * Active eCommerce CMS app main file. © 2017-2023 board.support. All rights reserved.
 *
 */

define('SB_AECOMMERCE', '1.0.1');

/*
 * ----------------------------------------------------------
 * DATABASE
 * ----------------------------------------------------------
 *
 */

function sb_aecommerce_db_connect() {
    return sb_external_db('connect', 'aecommerce');
}

function sb_aecommerce_db_get($query, $single = true) {
    return sb_external_db('read', 'aecommerce', $query, $single);
}

function sb_aecommerce_db_query($query, $return = false) {
    return sb_external_db('write', 'aecommerce', $query, $return);
}

/*
 * -----------------------------------------------------------
 * PANEL DATA
 * -----------------------------------------------------------
 *
 * Return the user details for the conversations panel
 *
 */

function sb_aecommerce_get_conversation_details($aecommerce_user_id) {
    $total = 0;
    $cart = [];
    $url = sb_get_setting('aecommerce-url');
    $url = substr($url, -1) == '/' ? substr($url, 0, -1) : $url;
    $aecommerce_user_id = sb_db_escape($aecommerce_user_id);

    // Total and orders
    $orders = sb_aecommerce_db_get('SELECT id, code, created_at AS `time`, grand_total AS `price` FROM orders WHERE user_id = ' . $aecommerce_user_id, false);
    for ($i = 0; $i < count($orders); $i++) {
        $total += floatval($orders[$i]['price']);
        $orders[$i]['url'] = $url . '/admin/all_orders/' . sb_aecommerce_encrypt($orders[$i]['id']) . '/show';
    }

    // Cart
    $user_id = sb_db_get('SELECT A.id FROM sb_users A, sb_users_data B WHERE A.id = B.user_id AND B.slug = "aecommerce-id" AND B.value = ' . $aecommerce_user_id . ' LIMIT 1');
    if (sb_is_error($user_id)) die(print_r($user_id, true));
    if (!empty($user_id)) {
        $user_id = $user_id['id'];
        $carts = sb_get_external_setting('aecommerce-carts');
        if (!empty($carts[$user_id])) {
            for ($i = 0; $i < count($carts[$user_id]); $i++){
                $item = sb_aecommerce_db_get('SELECT name, slug FROM products WHERE id = ' . sb_db_escape($carts[$user_id][$i][0]));
                if (!empty($item)) {
                    array_push($cart, ['id' => $carts[$user_id][$i][0], 'name' => $item['name'], 'quantity' => $carts[$user_id][$i][2], 'url' => $url . '/product/' . $item['slug']]);
                }

            }
        }
    }
    return ['total' => round($total, 2), 'orders_count' => count($orders), 'orders' => $orders, 'cart' => $cart, 'currency_symbol' => sb_get_setting('aecommerce-currency-symbol', '')];
}

/*
 * -----------------------------------------------------------
 * ENCRYPTION
 * -----------------------------------------------------------
 *
 * Crypt a value using the Active eCommerce system
 *
 */

function sb_aecommerce_encrypt($value) {
    $key_string = base64_decode(array_reverse(explode('base64:', sb_get_setting('aecommerce-key'), 2))[0]);
    $iv = random_bytes(openssl_cipher_iv_length('AES-128-CBC'));
    $value = openssl_encrypt(serialize($value), 'AES-256-CBC', $key_string, 0, $iv);
    $mac = hash_hmac('sha256', ($iv = base64_encode($iv)) . $value, $key_string);
    $json = json_encode(compact('iv', 'value', 'mac'));
    return base64_encode($json);
}

/*
 * -----------------------------------------------------------
 * CART
 * -----------------------------------------------------------
 *
 * 1. Save the users cart and link it the correct user
 * 2. Clean the carts from the database every 24h
 *
 */

function sb_aecommerce_cart($cart) {
    $active_user = sb_get_active_user();
    if ($active_user) {
        $carts = sb_get_external_setting('aecommerce-carts');
        $carts[$active_user['id']] = $cart;
        sb_save_external_setting('aecommerce-carts', $carts);
    }
}

function sb_aecommerce_clean_carts() {
    $day = date('d', time());
    if ($day != sb_get_external_setting('aecommerce-carts-last-clean')) {
        $carts = sb_get_external_setting('aecommerce-carts');
        if (!empty($carts) && count($carts) > 10) {
            sb_save_external_setting('aecommerce-carts', array_slice($carts, 0, 10, true));
        }
        sb_save_external_setting('aecommerce-carts-last-clean', $day);
    }
}

/*
 * -----------------------------------------------------------
 * USERS
 * -----------------------------------------------------------
 *
 * 1. Returns a customer, admin, seller
 * 2. Returns the extra users details
 * 3. Get the active aecommerce user and register it if required
 * 4. Function used internally by sb_get_active_user()
 * 5. Get all users
 * 6. Sync users
 * 7. Return the agent ID linked to the Active eCommerce user
 *
 */

function sb_aecommerce_get_user($user_id) {
    $user = sb_aecommerce_db_get('SELECT id, name AS `first_name`, email, password, avatar_original, user_type FROM users WHERE id = ' . sb_db_escape($user_id));
    if ($user) {
        if (!empty($user['avatar_original'])) {
            $file = sb_aecommerce_db_get('SELECT file_name FROM uploads WHERE id = ' . sb_db_escape($user['avatar_original']));
            $user['profile_image'] = empty($file) ? '' : (sb_get_setting('aecommerce-url') . '/public/' . $file['file_name']);
        }
        $user['user_type'] = $user['user_type'] == 'seller' || $user['user_type'] == 'staff' ? 'agent' : ($user['user_type'] == 'admin' ? 'admin' : 'user');
        $user['last_name'] = '';
        unset($user['avatar_original']);
    }
    return $user;
}

function sb_aecommerce_get_user_extra($user_id) {
    $settings = [];
    $address = sb_aecommerce_db_get('SELECT * FROM addresses WHERE user_id = ' . sb_db_escape($user_id));
    if (!empty($address)) {
        $settings['address'] = [$address['address'], ucfirst('Address')];
        $settings['city'] = [$address['city'], ucfirst('City')];
        $settings['country'] = [$address['country'], ucfirst('Country')];
        $settings['postal_code'] = [$address['postal_code'], ucfirst('Postal code')];
        $settings['phone'] = [$address['phone'], ucfirst('Phone')];
    };
    return $settings;
}

function sb_aecommerce_get_active_user($user_id) {
    $user = sb_aecommerce_get_user($user_id);
    $query = '';
    if ($user && isset($user['email'])) {
        $query = 'SELECT id, token FROM sb_users WHERE email ="' . $user['email'] . '" LIMIT 1';
        $user_db = sb_db_get($query);
        if ($user_db === '') {
            $settings_extra = array_merge(['aecommerce-id' => [$user_id, 'aecommerce ID']], sb_aecommerce_get_user_extra($user_id));
            $active_user = sb_get_active_user();
            if ($active_user && ($active_user['user_type'] == 'lead' || $active_user['user_type'] == 'visitor')) {
                sb_update_user($active_user['id'], $user, $settings_extra, false);
            } else {
                sb_add_user($user, $settings_extra, false);
            }
            $user = sb_db_get($query);
        } else {
            $user = $user_db;
        }
        if (sb_is_error($user) || !isset($user['token']) || !isset($user['id'])) {
            return false;
        } else {
            return sb_login('', '', $user['id'], $user['token']);
        }
    } else {
        return false;
    }
}

function sb_aecommerce_get_active_user_function($return, $login_app) {
    if ($return === false) {
        $return = sb_aecommerce_get_active_user($login_app);
    } else {
        $user = sb_aecommerce_get_user($login_app);
        if (sb_is_error($user)) die($user);
        if (isset($user['email']) && $user['email'] != $return['email']) {
            $return = sb_aecommerce_get_active_user($login_app);
        }
    }
    if (isset($return[1])) {
        $return = array_merge($return[0], ['cookie' => $return[1]]);
    }
    return $return;
}

function sb_aecommerce_get_all_users($type = 'customer') {
    $users = sb_aecommerce_db_get('SELECT id, name AS `first_name`, email, password, avatar_original, user_type FROM users WHERE user_type = "' . sb_db_escape($type) . '"' . ($type == 'admin' ? ' OR user_type = "staff"' : ''), false);
    $url = sb_get_setting('aecommerce-url');
    if (sb_is_error($users)) return $users;
    for ($i = 0; $i < count($users); $i++) {
        if (!empty($users[$i]['avatar_original'])) {
            $file = sb_aecommerce_db_get('SELECT file_name FROM uploads WHERE id = ' . sb_db_escape($users[$i]['avatar_original']));
            $users[$i]['profile_image'] = empty($file) ? '' : ($url . '/public/' . $file['file_name']);
        }
        $users[$i]['user_type'] = $type == 'seller' || $users[$i]['user_type'] == 'staff' ? 'agent' : ($type == 'admin' ? 'admin' : 'user');
        $users[$i]['last_name'] = '';
        unset($users[$i]['avatar_original']);
    }
    return $users;
}

function sb_aecommerce_sync($type = 'customer') {
    $users = sb_aecommerce_get_all_users($type);
    if (sb_is_error($users)) return $users;
    for ($i = 0; $i < count($users); $i++) {
        sb_add_user($users[$i], array_merge(['aecommerce-id' => [$users[$i]['id'], 'aecommerce ID']], sb_aecommerce_get_user_extra($users[$i]['id'])), false);
    }
    return true;
}

function sb_aecommerce_get_agent_id($aecommerce_user_id) {
    if (strpos($aecommerce_user_id, 'aecommerce') !== false) {
        $agent_id = sb_db_get('SELECT A.id FROM sb_users A, sb_users_data B WHERE A.id = B.user_id AND slug = "aecommerce-id" AND value = ' . substr(sb_db_escape($aecommerce_user_id), 11) . ' LIMIT 1');
        return sb_isset($agent_id, 'id', -1);
    }
    return $aecommerce_user_id;
}

?>
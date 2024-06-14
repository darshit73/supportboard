<?php

/*
 * ==========================================================
 * WHMCS APP
 * ==========================================================
 *
 * Martfury app main file. © 2017-2023 board.support. All rights reserved.
 *
 */

define('SB_MARTFURY', '1.0.0');

/*
 * ----------------------------------------------------------
 * DATABASE
 * ----------------------------------------------------------
 *
 */

function sb_martfury_db_connect() {
    return sb_external_db('connect', 'martfury');
}

function sb_martfury_db_get($query, $single = true) {
    return sb_external_db('read', 'martfury', $query, $single);
}

function sb_martfury_db_query($query, $return = false) {
    return sb_external_db('write', 'martfury', $query, $return);
}

/*
 * -----------------------------------------------------------
 * PANEL DATA
 * -----------------------------------------------------------
 *
 * Return the shop details for the conversations panel
 *
 */

function sb_martfury_get_conversation_details($user_id, $martfury_user_id) {
    $cart = [];
    $url = sb_get_setting('martfury-url');
    $url = substr($url, -1) == '/' ? substr($url, 0, -1) : $url;
    $orders = sb_martfury_db_get('SELECT id, amount, created_at FROM ec_orders WHERE user_id = ' . sb_db_escape($martfury_user_id), false);
    $count = count($orders);
    $code = '';
    $currency = sb_get_setting('martfury-currency-symbol');

    // Cart
    $session = sb_get_user_extra($user_id, 'martfury-session');
    $code_cart = '';
    if ($session) {
        $cart = sb_isset(unserialize($session), 'cart');
        if ($cart) {
            $cart = get_object_vars($cart['cart']);
            foreach ($cart as $key => $value) {
                if (strpos($key, 'items')) {
                    foreach ($value as $item) {
                        $item = get_object_vars($item);
                        $code_cart .= '<a href="' . $url .'/products/' . sb_string_slug($item['name']) . '" target="_blank" data-id="' . $item['id'] . '"><span>#' . $item['id'] . '</span> <span>' . $item['name'] . '</span> <span>x ' . $item['qty'] . '</span></a>';
                    }
                    break;
                }
            }
        }
    }
    $code .= ($code_cart ? $code_cart : '<p>' . sb_('The cart is currently empty.') . '</p>') . '</div>';

    // Total and orders
    $total = 0;
    if ($count) {
        $code .= '<div class="sb-title">'. sb_('Orders') . '</div><div class="sb-list-items sb-list-links sb-martfury-orders">';
        for ($i = 0; $i < $count; $i++) {
            $total += floatval($orders[$i]['amount']);
            $id = $orders[$i]['id'];
            $code .= '<a data-id="' . $id . '" href="' . $url . '/admin/orders/edit/' . $id . '" target="_blank"><span>#' . $id . '</span> <span>' . $orders[$i]['created_at'] . '</span> <span>' . $currency . $orders[$i]['amount'] . '</span></a>';
        }
        $code .= '</div>';
    }

    return '<h3>' . sb_get_setting('martfury-panel-title', 'Martfury') . '</h3><div><div class="sb-split"><div><div class="sb-title">' . sb_('Number of orders') . '</div><span>' . $count . ' ' . sb_('orders') . '</span></div><div><div class="sb-title">'. sb_('Total spend') . '</div><span>' . $currency . $total .'</span></div></div><div class="sb-title">' . sb_('Cart') . '</div><div class="sb-list-items sb-list-links sb-martfury-cart">' . $code;
}

/*
 * -----------------------------------------------------------
 * MISCELLANEOUS
 * -----------------------------------------------------------
 *
 * 1. Decrypt a value using the Martfury system
 * 2. Save the user session cookie
 *
 */

function sb_martfury_decrypt($value) {
    $base64_key = sb_get_setting('martfury-key');
    $payload = json_decode(base64_decode($value), true);
    $iv = random_bytes(openssl_cipher_iv_length('AES-128-CBC'));
    $key = base64_decode(substr($base64_key, 7));
    return openssl_decrypt($payload['value'],  'AES-256-CBC', $key, 0, $iv);
}

function sb_martfury_save_session($user_id = false) {
    if (!$user_id) $user_id = sb_get_active_user_ID();
    $cookie_value = sb_isset($_COOKIE, 'botble_session');
    if ($user_id && $cookie_value) {
        $cookie_value = sb_martfury_decrypt($cookie_value);
        $session_id = explode('|', $cookie_value)[1];
        $path = sb_get_setting('martfury-path') . '/storage/framework/sessions/' . $session_id;
        if (file_exists($path)) {
            $raw = str_replace('&amp;amp;', '&amp;', file_get_contents($path));
            $response = sb_update_user_value($user_id, 'martfury-session', $raw);
            if (in_array(sb_get_active_user()['user_type'], ['visitor', 'lead'])) {
                $session_value = unserialize($raw);
                foreach ($session_value as $key => $value) {
                    if (is_string($key) && strpos($key, 'login_customer_') !== false) {
                        $user_details = sb_martfury_get_user($value);
                        return ['user-updated', sb_update_user($user_id, $user_details[0], $user_details[1])];
                    }
                }
            }
            return $response;
        }
        return 'session-file-not-found: ' . $path;
    }
    return false;
}

function sb_martfury_get_session($user_id = false) {
    if (!$user_id) $user_id = sb_get_active_user_ID();
    return $user_id ? sb_get_user_extra($user_id, 'martfury-session') : false;
}

/*
 * -----------------------------------------------------------
 * USERS
 * -----------------------------------------------------------
 *
 * 1. Returns a Martfury user
 * 2. Sync users
 *
 */

function sb_martfury_get_user($martfury_user_id) {
    $martfury_user = sb_martfury_db_get('SELECT name, email, phone, avatar, dob FROM ec_customers WHERE id = ' . sb_db_escape($martfury_user_id));
    if ($martfury_user) {
        $name = sb_split_name($martfury_user['name']);
        $extra = ['martfury-id' => [$martfury_user_id, 'Martfury user ID']];
        if ($martfury_user['phone']) $extra['phone'] = [$martfury_user['phone'], 'Phone'];
        if ($martfury_user['dob']) $extra['birthday'] = [$martfury_user['dob'], 'Birthday'];
        $address = sb_martfury_db_get('SELECT * FROM ec_customer_addresses WHERE customer_id = ' . sb_db_escape($martfury_user_id));
        if ($address) {
            $address_fields = ['country', 'state', 'city', 'address', 'zip_code'];
            for ($i = 0; $i < count($address_fields); $i++) {
                $slug = $address_fields[$i];
                $value = sb_isset($address, $slug);
                if ($value) {
                    $extra[$slug] = [$value, sb_string_slug($slug, 'string')];
                }
            }
        }
        return [['first_name' => $name[0], 'last_name' => $name[1], 'email' => $martfury_user['email'], 'profile_image' => $martfury_user['avatar'] ? sb_get_setting('martfury-url') . '/storage/' . $martfury_user['avatar'] : '', 'user_type' => 'user'], $extra];
    }
    return $martfury_user;
}

function sb_martfury_import_users($vendors = false) {
    if ($vendors) {
        $users = sb_martfury_db_get('SELECT name, email, phone, city, address, state FROM mp_stores', false);
        for ($i = 0; $i < count($users); $i++) {
            $user = $users[$i];
            $extra = [];
            $keys = ['phone', 'city', 'address', 'state'];
            for ($j = 0; $j < count($keys); $j++) {
                $slug = $keys[$j];
                if ($user[$slug]) $extra[$slug] = [$user[$slug], sb_string_slug($slug, 'string')];
            }
            $name = sb_split_name($user['name']);
            sb_add_user(['first_name' => $name[0], 'last_name' => $name[1], 'email' => $user['email'], 'user_type' => 'agent'], $extra);
        }
    } else {
        $users = sb_martfury_db_get('SELECT id FROM ec_customers', false);
        for ($i = 0; $i < count($users); $i++) {
            $user = sb_martfury_get_user($users[$i]['id']);
            sb_add_user($user[0], $user[1]);
        }
    }
    return sb_is_error($users) ? $users : true;
}

?>
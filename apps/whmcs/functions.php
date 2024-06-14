<?php

/*
 * ==========================================================
 * WHMCS APP
 * ==========================================================
 *
 * WHMCS app main file. © 2017-2023 board.support. All rights reserved.
 *
 */

define('SB_WHMCS', '1.0.3');

/*
 * ----------------------------------------------------------
 * DATABASE
 * ----------------------------------------------------------
 *
 */

function sb_whmcs_db_connect() {
    return sb_external_db('connect', 'whmcs');
}

function sb_whmcs_db_get($query, $single = true) {
    return sb_external_db('read', 'whmcs', $query, $single);
}

function sb_whmcs_db_query($query, $return = false) {
    return sb_external_db('write', 'whmcs', $query, $return);
}

/*
 * -----------------------------------------------------------
 * PANEL DATA
 * -----------------------------------------------------------
 *
 * Return the user details for the conversations panel
 *
 */

function sb_whmcs_get_conversation_details($whmcs_id) {
    $services_count = 0;
    $total = 0;
    $products = [];
    $addons = [];
    $domains = [];
    $whmcs_id = sb_db_escape($whmcs_id);
    $client_id = sb_isset(sb_whmcs_db_get('SELECT A.id FROM ' . SB_WHMCS_DB_PREFIX . 'clients A, ' . SB_WHMCS_DB_PREFIX . 'users B WHERE A.email = B.email and B.id = ' . $whmcs_id), 'id', $whmcs_id);

    // Total
    $invoices = sb_whmcs_db_get('SELECT subtotal FROM ' . SB_WHMCS_DB_PREFIX . 'invoices WHERE status = "Paid" AND userid = ' . $whmcs_id, false);
    for ($i = 0; $i < count($invoices); $i++) {
        $total += floatval($invoices[$i]['subtotal']);
    }

    // Services
    $products = sb_whmcs_db_get('SELECT B.name FROM ' . SB_WHMCS_DB_PREFIX . 'hosting A, ' . SB_WHMCS_DB_PREFIX . 'products B WHERE A.packageid = B.id AND A.userid = ' . $whmcs_id, false);
    $addons = sb_whmcs_db_get('SELECT B.name FROM ' . SB_WHMCS_DB_PREFIX . 'hostingaddons A, ' . SB_WHMCS_DB_PREFIX . 'addons B WHERE A.addonid = B.id AND A.userid = ' . $whmcs_id, false);
    $domains = sb_whmcs_db_get('SELECT domain AS `name` FROM ' . SB_WHMCS_DB_PREFIX . 'domains WHERE userid = ' . $whmcs_id, false);
    $services_count = count($products) + count($addons) + count($domains);

    return ['total' => round($total, 2), 'services_count' => $services_count, 'products' => $products, 'addons' => $addons, 'domains' => $domains, 'currency_symbol' => sb_get_setting('whmcs-currency-symbol', ''), 'client-id' => $client_id];
}

/*
 * -----------------------------------------------------------
 * USERS
 * -----------------------------------------------------------
 *
 * 1. Return an admin
 * 2. Return a user
 * 3. Get the active WHMCS user and register it if required
 * 4. Function used internally by sb_get_active_user()
 * 5. Get all users
 * 6. Sync users
 *
 */

function sb_whmcs_get_admin($admin_id) {
    return sb_whmcs_db_get('SELECT id, username, password, firstname AS `first_name`, lastname AS `last_name`, email FROM ' . SB_WHMCS_DB_PREFIX . 'admins WHERE id = ' . sb_db_escape($admin_id));
}

function sb_whmcs_get_user($user_id) {
    return sb_whmcs_db_get('SELECT id, first_name, last_name, email, password FROM ' . SB_WHMCS_DB_PREFIX . 'users WHERE id = ' . sb_db_escape($user_id));
}

function sb_whmcs_get_active_user($user_id) {
    $user = sb_whmcs_get_user($user_id);
    $query = '';
    if ($user && isset($user['email'])) {
        $query = 'SELECT id, token FROM sb_users WHERE email ="' . $user['email'] . '" LIMIT 1';
        $user_db = sb_db_get($query);
        if ($user_db === '') {
            $settings_extra = ['whmcs-id' => [$user['id'], 'Whmcs ID']];
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

function sb_whmcs_get_active_user_function($return, $login_app) {
    if ($return === false) {
        $return = sb_whmcs_get_active_user($login_app);
    } else {
        $user = sb_whmcs_get_user($login_app);
        if (sb_is_error($user)) die($user);
        if (isset($user['email']) && $user['email'] != $return['email']) {
            $return = sb_whmcs_get_active_user($login_app);
        }
    }
    if (isset($return[1])) {
        $return = array_merge($return[0], ['cookie' => $return[1]]);
    }
    return $return;
}

function sb_whmcs_get_all_users() {
    return sb_whmcs_db_get('SELECT id, first_name, last_name, email, password FROM ' . SB_WHMCS_DB_PREFIX . 'users', false);
}

function sb_whmcs_sync() {
    $users = sb_whmcs_get_all_users();
    if (sb_is_error($users)) return $users;
    for ($i = 0; $i < count($users); $i++) {
        sb_add_user($users[$i], ['whmcs-id' => [$users[$i]['id'], 'Whmcs ID']], false);
    }
    return true;
}

/*
 * ----------------------------------------------------------
 * KNOWLEDGE BASE ARTICLES
 * ----------------------------------------------------------
 *
 * Import articles into Support Board
 *
 */

function sb_whmcs_articles_sync() {
    $articles = sb_get_articles(-1, false, true);
    $article_titles = [];
    for ($i = 0; $i < count($articles); $i++) {
        array_push($article_titles, $articles[$i]['title']);
    }
    $whmcs_articles = sb_whmcs_db_get('SELECT title, article FROM ' . SB_WHMCS_DB_PREFIX . 'knowledgebase', false);
    if (sb_is_error($whmcs_articles)) return $whmcs_articles;
    for ($i = 0; $i < count($whmcs_articles); $i++) {
        if (!in_array($whmcs_articles[$i]['title'], $article_titles)) {
            array_push($articles, ['id' => rand(100, 10000), 'title' => $whmcs_articles[$i]['title'], 'content' => $whmcs_articles[$i]['article'], 'link' => '']);
        }
    }
    return sb_save_articles($articles);
}

?>
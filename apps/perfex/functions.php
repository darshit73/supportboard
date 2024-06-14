<?php

/*
 * ==========================================================
 * PERFEX CRM APP
 * ==========================================================
 *
 * Perfex CRM App main file. © 2017-2023 board.support. All rights reserved.
 *
 */

define('SB_PERFEX', '1.1.1');

/*
 * ----------------------------------------------------------
 * DATABASE
 * ----------------------------------------------------------
 *
 */

function sb_perfex_db_connect() {
    return sb_external_db('connect', 'perfex');
}

function sb_perfex_db_get($query, $single = true) {
    return sb_external_db('read', 'perfex', $query, $single);
}

function sb_perfex_db_query($query, $return = false) {
    return sb_external_db('write', 'perfex', $query, $return);
}

/*
 * ----------------------------------------------------------
 * USERS
 * ----------------------------------------------------------
 *
 * 1. Get the active Perfex user and register it if it's not a Support Board user
 * 2. Used internally by sb_get_active_user()
 * 3. Get user details
 * 4. Get all contacts
 * 5. Synch contacts with Support Board
 * 6. Set the profile image
 *
 */

function sb_perfex_get_active_user($user_id) {
    $user = sb_perfex_get_user($user_id, false);
    $query = '';
    if ($user && isset($user['email'])) {
        $query = 'SELECT id, token FROM sb_users WHERE email ="' . $user['email'] . '" LIMIT 1';
        $user_db = sb_db_get($query);
        if ($user_db === '') {
            $settings_extra = ['phone' => [$user['phone'], 'Phone'], 'perfex-id' => [$user['id'], 'Perfex ID']];
            $active_user = sb_get_active_user();
            if ($active_user && ($active_user['user_type'] == 'lead' || $active_user['user_type'] == 'visitor')) {
                sb_update_user($user['id'], $user, $settings_extra, false);
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

function sb_perfex_get_active_user_function($return, $login_app) {
    if ($return === false) {
        $return = sb_perfex_get_active_user($login_app);
    } else {
        $user = sb_perfex_get_user($login_app, false);
        if (sb_is_error($user)) die($user);
        if (isset($user['email']) && $user['email'] != $return['email']) {
            $return = sb_perfex_get_active_user($login_app);
        }
    }
    if (isset($return[1])) {
        $return = array_merge($return[0], ['cookie' => $return[1]]);
    }
    return $return;
}

function sb_perfex_get_user($user_id, $admin = true) {
    $contact_id = false;
    if (is_array($user_id)) {
        $contact_id = $user_id[1];
        $user_id = $user_id[0];
    }
    $contact_id = sb_db_escape($contact_id);
    $user_id = sb_db_escape($user_id);
    $perfex_user = sb_perfex_db_get('SELECT ' . ($admin ? 'staffid AS `id`, profile_image, firstname AS `first_name`, lastname AS `last_name`, email, password, facebook, linkedin, skype, phonenumber AS `phone`' : 'id, profile_image, firstname AS `first_name`, lastname AS `last_name`, email, password, phonenumber AS `phone`') . ' FROM ' . SB_PERFEX_DB_PREFIX . ($admin ? 'staff' : 'contacts') . ' WHERE ' . ($admin ? 'staffid' : 'userid') . ' = ' . $user_id . ($admin || empty($contact_id) ? '' : (' AND id = ' . $contact_id)));
    if (!empty($perfex_user)) {
        $perfex_user['profile_image'] = sb_perfex_set_profile_image($perfex_user, $admin);
    }
    return $perfex_user;
}

function sb_perfex_get_all_contacts() {
    return sb_perfex_db_get('SELECT id, profile_image, firstname AS `first_name`, lastname AS `last_name`, email, password, phonenumber AS `phone` FROM ' . SB_PERFEX_DB_PREFIX . 'contacts', false);
}

function sb_perfex_sync() {
    $contacts = sb_perfex_get_all_contacts();
    if (sb_is_error($contacts)) return $contacts;
    for ($i = 0; $i < count($contacts); $i++) {
        $extra = [];
        $contacts[$i]['profile_image'] = sb_perfex_set_profile_image($contacts[$i], false);
        if ($contacts[$i]['phone']) {
            $extra['phone'] = [$contacts[$i]['phone'], 'Phone'];
        }
        sb_add_user($contacts[$i], $extra);
    }
    return true;
}

function sb_perfex_set_profile_image($user, $admin = true) {
    return empty($user['profile_image']) || $user['profile_image'] == 'null' ? '' : (sb_get_setting('perfex-url') . '/uploads/' . ($admin ? 'staff' : 'client') . '_profile_images/' . $user['id'] . '/thumb_' . $user['profile_image']);
}

/*
 * ----------------------------------------------------------
 * KNOWLEDGE BASE ARTICLES
 * ----------------------------------------------------------
 *
 * Import articles into Support Board
 *
 */

function sb_perfex_articles_sync() {
    $articles = sb_get_articles(-1, false, true);
    $count = count($articles);
    if ($count) {
        if (!isset($articles[0]['title']) && isset($articles[0][0]['title'])) {
            $articles = $articles[0];
            $count = count($articles);
        }
        $article_titles = [];
        for ($i = 0; $i < $count; $i++) {
            array_push($article_titles, $articles[$i]['title']);
        }
        $perfex_articles = sb_perfex_db_get('SELECT subject, description FROM ' . SB_PERFEX_DB_PREFIX . 'knowledge_base', false);
        if (sb_is_error($perfex_articles)) return $perfex_articles;
        for ($i = 0; $i < count($perfex_articles); $i++) {
            if (!in_array($perfex_articles[$i]['subject'], $article_titles)) {
                array_push($articles, ['id' => rand(100, 10000), 'title' => $perfex_articles[$i]['subject'], 'content' => $perfex_articles[$i]['description'], 'link' => '']);
            }
        }
        return sb_save_articles($articles);
    }
    return false;
}

?>
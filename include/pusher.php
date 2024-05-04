<?php

/*
 * ==========================================================
 * PUSHER.PHP
 * ==========================================================
 *
 * Pusher authentication file.
 * © 2017-2023 board.support. All rights reserved.
 *
 */

require_once('../config.php');
if (defined('SB_CROSS_DOMAIN') && SB_CROSS_DOMAIN) {
    header('Access-Control-Allow-Origin: *');
}
if (!isset($_POST['channel_name'])) die();
require('functions.php');
$active_user = sb_get_active_user(sb_isset($_POST, 'login'));
if ($active_user) {
    require SB_PATH . '/vendor/pusher/autoload.php';
    $pusher = false;
    if (sb_is_cloud()) {
        $pusher = new Pusher\Pusher(CLOUD_PUSHER_KEY, CLOUD_PUSHER_SECRET, CLOUD_PUSHER_ID, ['cluster' => CLOUD_PUSHER_CLUSTER]);
    } else {
        $settings = sb_get_setting('pusher');
        $pusher = new Pusher\Pusher($settings['pusher-key'], $settings['pusher-secret'], $settings['pusher-id'], ['cluster' => $settings['pusher-cluster']]);
    }
    if (strpos($_POST['channel_name'], 'presence') === false) {
        die($pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']));
    } else {
        die($pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $active_user['id'], ['id' => $active_user['id'], 'first_name' => $active_user['first_name'], 'last_name' => $active_user['last_name'], 'user_type' => $active_user['user_type']]));
    }
} else die('Forbidden');

?>
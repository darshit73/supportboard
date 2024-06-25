<?php

/*
 * ==========================================================
 * GOOGLE.PHP
 * ==========================================================
 *
 * Google and Dialogflow synchronization.
 * © 2021 board.support. All rights reserved.
 *
 */

require('functions.php');

if (isset($_GET['code'])) {
    $info = sb_google_key();
    if (empty($info[0]) || empty($info[1])) {
        die('<br><br>Please enter Client ID and Client Secret in Support Board > Settings > Artificial Intelligence > Google.');
    }
    $query = '{ code: "' . $_GET['code'] . '", grant_type: "authorization_code", client_id: "' . $info[0] . '", client_secret: "' . $info[1] . '", redirect_uri: "' . SB_URL . '/include/google.php" }';
    $response = sb_curl('https://accounts.google.com/o/oauth2/token', $query, ['Content-Type: application/json', 'Content-Length: ' . strlen($query)]);
    if ($response && isset($response['refresh_token'])) {
        die('<br><br>Copy the refresh token below and paste it in Support Board > Settings > Artificial Intelligence > Google > Refresh token.<br><br><b>' . $response['refresh_token'] . '</b>');
    } else {
        echo '<br><br>Error: ' . print_r($response, true);
    }
}

if (isset($_GET['refresh-token'])) {
    $info = sb_google_key();
    $query = '{ refresh_token: "' . $_GET['refresh-token'] . '", grant_type: "refresh_token", client_id: "' . $info[0] . '", client_secret: "' . $info[1] . '" }';
    die(json_encode(sb_curl('https://accounts.google.com/o/oauth2/token', $query, ['Content-Type: application/json', 'Content-Length: ' . strlen($query)])));
}

?>
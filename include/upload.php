<?php

/*
 * ==========================================================
 * UPLOAD.PHP
 * ==========================================================
 *
 * Manage all uploads of front-end and admin. © 2017-2023 board.support. All rights reserved.
 *
 */

require_once('../include/functions.php');
if (defined('SB_CLOUD')) {
    $data = json_decode(openssl_decrypt(base64_decode(isset($_POST['cloud']) ? $_POST['cloud'] : $_COOKIE['sb-cloud']), 'AES-256-CBC', hash('sha256', SB_CLOUD_KEY), 0, substr(hash('sha256', 'supportboard_iv'), 0, 16)), true);
    require_once(SB_CLOUD_PATH . '/script/config/config_' . $data['token'] . '.php');
}
if (defined('SB_CROSS_DOMAIN') && SB_CROSS_DOMAIN) {
    header('Access-Control-Allow-Origin: *');
}
if (isset($_FILES['file'])) {
    if (0 < $_FILES['file']['error']) {
        die(json_encode(['error', 'Support Board: Error into upload.php file.']));
    } else {
        $file_name = htmlspecialchars(str_replace(['javascript:', 'onclick=', 'onerror=', '<script', '</script'], '', $_FILES['file']['name']), ENT_NOQUOTES | ENT_SUBSTITUTE, 'utf-8');
        $infos = pathinfo($file_name);
        $directory_date = date('d-m-y');
        $path = '../uploads/' . $directory_date;
        $url = SB_URL . '/uploads/' . $directory_date;
        if (sb_is_allowed_extension(sb_isset($infos, 'extension'))) {
            if (defined('SB_UPLOAD_PATH') && SB_UPLOAD_PATH && defined('SB_UPLOAD_URL') && SB_UPLOAD_URL) {
                $path = SB_UPLOAD_PATH . '/' . $directory_date;
                $url = SB_UPLOAD_URL . '/' . $directory_date;
            }
            if (!file_exists($path)) {
                mkdir($path, 0777, true);
            }
            $file_name = rand(1000, 99999) . '_' . sb_string_slug($file_name);
            $path = $path . '/' . $file_name;
            $url = $url . '/' . $file_name;
            move_uploaded_file($_FILES['file']['tmp_name'], $path);
            if (sb_get_multi_setting('amazon-s3', 'amazon-s3-active') || defined('SB_CLOUD_AWS_S3')) {
                $url_aws = sb_aws_s3($path);
                if (strpos($url_aws, 'http') === 0) {
                    $url = $url_aws;
                    unlink($path);
                }
            }
            die(json_encode(['success', $url]));
        } else {
            die(json_encode(['success', 'extension_error']));
        }
    }
} else {
    die(json_encode(['error', 'Support Board Error: Key file in $_FILES not found.']));
}

?>
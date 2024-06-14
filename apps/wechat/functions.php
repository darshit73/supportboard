<?php

/*
 * ==========================================================
 * WECHAT APP
 * ==========================================================
 *
 * WeChat app main file. © 2017-2023 board.support. All rights reserved.
 *
 * 1. Send a message to WeChat
 * 2. Rich messages
 * 3. Get access token
 *
 */

define('SB_WECHAT', '1.0.1');

function sb_wechat_send_message($open_id, $message = '', $attachments = [], $access_token = false) {
    if (empty($message) && empty($attachments)) return false;
    $query = ['touser' => $open_id];
    $response = false;

    // Get access token
    if (!$access_token) $access_token = sb_wechat_get_access_token();

    // Rich messages
    $message = sb_wechat_rich_messages($message, $open_id);
    if ($message[1]) $attachments = $message[1];
    $message = $message[0];

    // Attachments
    for ($i = 0; $i < count($attachments); $i++) {
        $extension = strtolower(sb_isset(pathinfo($attachments[$i][1]), 'extension'));
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
            $link = $attachments[$i][1];
            $path = substr($link, strrpos(substr($link, 0, strrpos($link, '/')), '/'));
            $type = 'image';
            $media_id = sb_isset(sb_curl('https://api.weixin.qq.com/cgi-bin/media/upload?access_token=' . $access_token . '&type=' . $type, ['media' => new CURLFile(sb_upload_path() . $path)], [], 'UPLOAD'), 'media_id');
            if ($media_id) {
                $query['msgtype'] = $type;
                $query[$type] = ['media_id' => $media_id];
                $response = sb_curl('https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' . $access_token, json_encode($query, JSON_INVALID_UTF8_IGNORE | JSON_UNESCAPED_UNICODE));
            }
        } else {
            $message .= ($message ? PHP_EOL : '') . $attachments[$i][1];
        }
    }

    // Send message
    if ($message) {
        $query['msgtype'] = 'text';
        $query['text'] = ['content' => sb_clear_text_formatting($message)];
        $response = sb_curl('https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' . $access_token, json_encode($query, JSON_INVALID_UTF8_IGNORE | JSON_UNESCAPED_UNICODE));
        if (in_array(sb_isset($response, 'errcode'), [42001, 40001])) return sb_wechat_send_message($open_id, $message, $attachments);
    }

    return [$response, $access_token];
}

function sb_wechat_rich_messages($message, $extra = false) {
    $shortcode = sb_get_shortcode($message);
    $attachments = [];
    if ($shortcode) {
        $shortcode_id = sb_isset($shortcode, 'id', '');
        $shortcode_name = $shortcode['shortcode_name'];
        $message = trim(str_replace($shortcode['shortcode'], '', $message) . (isset($shortcode['title']) ? ' *' . sb_($shortcode['title']) . '*' : '') . PHP_EOL . sb_(sb_isset($shortcode, 'message', '')));
        switch ($shortcode_name) {
            case 'slider-images':
                $attachments = explode(',', $shortcode['images']);
                for ($i = 0; $i < count($attachments); $i++) {
                    $attachments[$i] = [$attachments[$i], $attachments[$i]];
                }
                $message = '';
                break;
            case 'slider':
            case 'card':
                $suffix = $shortcode_name == 'slider' ? '-1' : '';
                $message =  sb_($shortcode['header' . $suffix]) . (isset($shortcode['description' . $suffix]) ? (PHP_EOL . PHP_EOL . $shortcode['description' . $suffix]) : '') . (isset($shortcode['extra' . $suffix]) ? (PHP_EOL . $shortcode['extra' . $suffix]) : '') . (isset($shortcode['link' . $suffix]) ? (PHP_EOL . PHP_EOL . $shortcode['link' . $suffix]) : '');
                $attachments = [[$shortcode['image' . $suffix], $shortcode['image' . $suffix]]];
                break;
            case 'list-image':
            case 'list':
                $index = 0;
                if ($shortcode_name == 'list-image') {
                    $shortcode['values'] = str_replace('://', '', $shortcode['values']);
                    $index = 1;
                }
                $values = explode(',', $shortcode['values']);
                if (strpos($values[0], ':')) {
                    for ($i = 0; $i < count($values); $i++) {
                        $value = explode(':', $values[$i]);
                        $message .= PHP_EOL . trim($value[$index]) . ' ' . trim($value[$index + 1]);
                    }
                } else {
                    for ($i = 0; $i < count($values); $i++) {
                        $message .= PHP_EOL . trim($values[$i]);
                    }
                }
                break;
            case 'select':
            case 'buttons':
            case 'chips':
                $values = explode(',', $shortcode['options']);
                for ($i = 0; $i < count($values); $i++) {
                    $message .= PHP_EOL . sb_($values[$i]);
                }
                if ($shortcode_id == 'sb-human-takeover' && defined('SB_DIALOGFLOW')) {
                    sb_dialogflow_set_active_context('human-takeover', [], 2, false, sb_isset(sb_get_user_by('wechat-id', $extra), 'id'));
                }
                break;
            case 'button':
                $message = $shortcode['link'];
                break;
            case 'video':
                $message = ($shortcode['type'] == 'youtube' ? 'https://www.youtube.com/embed/' : 'https://player.vimeo.com/video/') . $shortcode['id'];
                break;
            case 'image':
                $attachments = [[$shortcode['url'], $shortcode['url']]];
                break;
            case 'rating':
                if (defined('SB_DIALOGFLOW')) sb_dialogflow_set_active_context('rating', [], 2, false, sb_isset(sb_get_user_by('wechat-id', $extra), 'id'));
                break;
            case 'articles':
                if (isset($shortcode['link'])) $message = $shortcode['link'];
                break;
            default:
                $message = '';
                $attachments = [];
        }
    }
    return [$message, $attachments];
}

function sb_wechat_get_access_token() {
    $settings = sb_get_setting('wechat');
    return sb_get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' . $settings['wechat-app-id'] . '&secret=' . $settings['wechat-app-secret'], true)['access_token'];
}

?>
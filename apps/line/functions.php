<?php

/*
 * ==========================================================
 * LINE APP
 * ==========================================================
 *
 * Line app main file. © 2017-2023 board.support. All rights reserved.
 *
 * 1. Send a message to Line
 * 2. Convert Support Board rich messages to Line rich messages
 * 3. Line curl
 *
 */

define('SB_LINE', '1.0.0');

function sb_line_send_message($line_id, $message = '', $attachments = []) {
    if (empty($message) && empty($attachments)) return false;
    $user_id = defined('SB_DIALOGFLOW') ? sb_get_user_by('line-id', $line_id)['id'] : false;
    $response = false;

    // Send the message
    $query = ['to' => $line_id];
    $message = sb_line_rich_messages($message, ['user_id' => $user_id]);
    $attachments = array_merge($attachments, $message[1]);
    if ($message[0] || $message[2]) {
        if ($message[0]) $query['messages'] = [['type' => 'text', 'text' => $message[0]]];
        if ($message[2]) $query['messages'] = $message[2];
        $response = sb_line_curl('message/push', $query);
    }

    // Attachments
    $count = count($attachments);
    if ($count) {
        $messages = [];
        for ($i = 0; $i < count($attachments); $i++) {
            $url = $attachments[$i][1];
            $extension = substr($url, strripos($url, '.') + 1);
            switch ($extension) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                    array_push($messages, ['type' => 'image', 'originalContentUrl' => $url, 'previewImageUrl' => $url]);
                    break;
                case 'mp4':
                    array_push($messages, ['type' => 'video', 'originalContentUrl' => $url, 'previewImageUrl' => SB_URL . '/media/thumb.png']);
                    break;
                default:
                    array_push($messages, ['type' => 'text', 'text' => $url]);
            }
        }
        $query['messages'] = $messages;
        $response = sb_line_curl('message/push', $query);
    }
    return ['error' => empty($response) ? false : $response];
}

function sb_line_rich_messages($message, $extra = false) {
    $messages = [];
    $message = sb_clear_text_formatting($message);
    $shortcode = sb_get_shortcode($message);
    $attachments = [];
    if ($shortcode) {
        $shortcode_id = sb_isset($shortcode, 'id', '');
        $shortcode_name = $shortcode['shortcode_name'];
        $message = trim(str_replace($shortcode['shortcode'], '', $message) . sb_isset($shortcode, 'title', '') . PHP_EOL . sb_(sb_isset($shortcode, 'message', '')));
        switch ($shortcode_name) {
            case 'slider-images':
            case 'slider':
            case 'card':
                $cards = [];
                if ($shortcode_name == 'slider-images') {
                    $images = explode(',', $shortcode['images']);
                    for ($i = 0; $i < count($images); $i++) {
                        array_push($cards, ['imageUrl' => $images[$i], 'action' => ['type' => 'postback', 'label' => ' ', 'data' => '#']]);
                    }
                    array_push($messages, ['type' => 'template', 'altText' => 'Error', 'template' => ['type' => 'image_carousel', 'columns' =>$cards]]);
                } else {
                    $index = $shortcode_name == 'slider' ? 1 : 0;
                    while (isset($shortcode['image' . ($index ? '-' . $index : '')])) {
                        $suffix = $index ? '-' . $index : '';
                        $text = $shortcode['description' . $suffix] . PHP_EOL . sb_isset($shortcode, 'extra'. $suffix, '');
                        if (strlen($text) > 60) $text = substr($text, 0, 57) . '...';
                        array_push($cards, ['thumbnailImageUrl' => sb_isset($shortcode, 'image' . $suffix), 'title' => $shortcode['header' . $suffix], 'text' => $text, 'actions' => [['type' => 'uri', 'label' => sb_isset($shortcode, 'link-text' . $suffix), 'uri' => sb_isset($shortcode, 'link' . $suffix)]]]);
                        $index++;
                    }
                    array_push($messages, ['type' => 'template', 'altText' => 'Error', 'template' => ['type' => 'carousel', 'columns' =>$cards]]);
                }
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
                        $message .= PHP_EOL . '• ' . trim($value[$index]) . ' ' . trim($value[$index + 1]);
                    }
                } else {
                    for ($i = 0; $i < count($values); $i++) {
                        $message .= PHP_EOL . '• ' . trim($values[$i]);
                    }
                }
                $message = trim($message);
                break;
            case 'select':
            case 'buttons':
            case 'chips':
                $values = explode(',', $shortcode['options']);
                $buttons = [];
                $count = count($values);
                if ($count > 13) $count = 13;
                for ($i = 0; $i < $count; $i++) {
                    array_push($buttons, ['type' => 'action', 'action' => ['type' => 'message', 'label' => substr($values[$i], 0, 20), 'text' => $values[$i]]]);
                }
                array_push($messages, ['type' => 'text', 'text' => $message, 'quickReply' => ['items' => $buttons]]);
                $message = '';
                if ($shortcode_id == 'sb-human-takeover' && defined('SB_DIALOGFLOW')) sb_dialogflow_set_active_context('human-takeover', [], 2, false, sb_isset($extra, 'user_id'));
                break;
            case 'share':
            case 'button':
                $message .= ($message ? PHP_EOL  : '') . $shortcode['link'];
                break;
            case 'video':
                $message .= ($message ? PHP_EOL  : '') . ($shortcode['type'] == 'youtube' ? 'https://www.youtube.com/embed/' : 'https://player.vimeo.com/video/') . $shortcode['id'];
                break;
            case 'image':
                $attachments = [[$shortcode['url'], $shortcode['url']]];
                break;
            case 'rating':
                $labels = [sb_isset($shortcode, 'label-positive'), sb_isset($shortcode, 'label-negative')];
                if ($labels[0] && $labels[1]) {
                    $buttons = [];
                    for ($i = 0; $i < 2; $i++) {
                        array_push($buttons, ['type' => 'action', 'action' => ['type' => 'message', 'label' => substr($labels[$i], 0, 20), 'text' => $labels[$i]]]);
                    }
                    array_push($messages, ['type' => 'text', 'text' => $message, 'quickReply' => ['items' => $buttons]]);
                    $message = '';
                }
                if (defined('SB_DIALOGFLOW')) sb_dialogflow_set_active_context('rating', [], 2, false, sb_isset($extra, 'user_id'));
                break;
            case 'articles':
                if (isset($shortcode['link'])) $message = $shortcode['link'];
                break;
        }
    }
    return [$message, $attachments, $messages];
}

function sb_line_curl($url_part, $query = '', $method = 'POST') {
    $response = sb_curl('https://api.line.me/v2/bot/' . $url_part, json_encode($query), ['Content-Type: application/json', 'Authorization: Bearer ' . sb_get_multi_setting('line', 'line-token')], $method);
    return $method == 'GET' ? json_decode($response, true) : $response;
}
?>
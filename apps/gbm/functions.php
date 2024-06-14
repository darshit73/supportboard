<?php

/*
 * ==========================================================
 * GOOGLE BUSINESS MESSAGES APP
 * ==========================================================
 *
 * Google Business Messages app main file. © 2017-2023 board.support. All rights reserved.
 *
 * 1. Send a message to Google Business Message
 * 2. Rich messages
 * 3. Get token
 * 4. Get conversation ID
 * 5. Base 64 encode
 *
 */

define('SB_GBM', '1.0.0');
$sb_recursion = true;

function sb_gbm_send_message($google_conversation_id, $message = '', $attachments = [], $token = false) {
    if (empty($message) && empty($attachments)) return false;
    if (!$token) $token = sb_gbm_get_token();
    $user = sb_get_user_by('gbm-id', $google_conversation_id);
    $url = 'https://businessmessages.googleapis.com/v1/conversations/' . $google_conversation_id . '/messages';
    $header = ['Content-Type: application/json', 'Authorization: Bearer ' . $token];
    $is_agent = sb_is_agent(false, true);
    $representative = ['avatarImage' => sb_get_setting('gbm-avatar-image', ''), 'displayName' => $is_agent ? sb_get_user_name() : sb_get_setting('bot-name', 'Bot'), 'representativeType' => $is_agent ? 'HUMAN' : 'BOT'];
    $response = false;

    // Send the message
    if ($message) {
        $message_data = sb_gbm_rich_messages(sb_clear_text_formatting($message), ['user_id' => $user['id']]);
        $query = json_encode(array_merge(['messageId' => 'sb' . rand(9999,99999), 'representative' => $representative, 'containsRichText' => true], $message_data), JSON_INVALID_UTF8_IGNORE | JSON_UNESCAPED_UNICODE);
        $response = sb_curl($url, $query, $header);
    }

    // Attachments
    $response_attachments = [];
    for ($i = 0; $i < count($attachments); $i++) {
        $link = str_replace(' ', '%20', $attachments[$i][1]);
        $query = ['messageId' => 'sb' . rand(9999,99999), 'representative' => $representative];
        $query_2 = [];
        if (in_array(strtolower(sb_isset(pathinfo($link), 'extension')), ['jpg', 'jpeg', 'png'])) {
            $query_2 = ['fallback' => $link, 'image' => ['contentInfo' => ['altText' => 'Image', 'fileUrl' => $link, 'forceRefresh' => false]]];
        } else {
            $query_2 = ['text' => $link];
        }
        array_push($response_attachments, sb_curl($url, json_encode(array_merge($query, $query_2)), $header));
    }

    // Token check
    if ($response && isset($response['error']) && $response['error']['status'] == 'UNAUTHENTICATED') {
        global $sb_recursion;
        if ($sb_recursion) {
            $sb_recursion = false;
            return sb_gbm_send_message($google_conversation_id, $message, $attachments);
        }
    }

    return [$response, $response_attachments, $token];
}

function sb_gbm_rich_messages($message, $extra = false) {
    $shortcode = sb_get_shortcode($message);
    $rich_message = false;
    $fallback = '';
    if ($shortcode) {
        $shortcode_id = sb_isset($shortcode, 'id', '');
        $shortcode_name = $shortcode['shortcode_name'];
        $message = trim(str_replace($shortcode['shortcode'], '', $message) . (isset($shortcode['title']) ? '**' . sb_($shortcode['title']) . '**' . PHP_EOL : '') . PHP_EOL . sb_(sb_isset($shortcode, 'message', '')));
        switch ($shortcode_name) {
            case 'slider-images':
                $cards = [];
                $fallback = '';
                $attachments = explode(',', $shortcode['images']);
                for ($i = 0; $i < count($attachments); $i++) {
                    array_push($cards, ['media' => ['height' => 'TALL', 'contentInfo' => ['altText' => 'Image', 'fileUrl' => $attachments[$i][0], 'forceRefresh' => false]]]);
                    $fallback .= PHP_EOL . $attachments[$i][0];
                }
                $rich_message = ['fallback' => trim($fallback), 'richCard' => ['carouselCard' => ['cardWidth' => 'MEDIUM', 'cardContents' => $cards]]];
                break;
            case 'slider':
            case 'card':
                $slider = $shortcode_name == 'slider';
                $index = $slider ? 1 : true;
                $cards = [];
                while ($index) {
                    $suffix = $slider ? '-' . $index : '';
                    if (!$slider) $index = false;
                    if (isset($shortcode['header' . $suffix])) {
                        $index++;
                        $link = sb_isset($shortcode, 'link' . $suffix);
                        $suggestions = $link ? [['action' => ['text' => sb_(sb_isset($shortcode, 'link-text' . $suffix, $link)), 'postbackData' => $link, 'openUrlAction' => ['url' => $link]]]] : [];
                        $title = sb_(sb_isset($shortcode, 'header' . $suffix));
                        $description = sb_isset($shortcode, 'description' . $suffix) . (isset($shortcode['extra' . $suffix]) ? PHP_EOL . PHP_EOL. $shortcode['extra' . $suffix] : '');
                        if (strlen($title) > 200) $title = substr($title, 0, 196) . '...';
                        if (strlen($description) > 2000) $description = substr($description, 0, 1996) . '...';
                        $fallback .= PHP_EOL . ($title ? '**' . $title . '**' : '') . ($description ? PHP_EOL . $description : '');
                        array_push($cards, ['title' => $title, 'description' => $description, 'media' => ['height' => 'TALL', 'contentInfo' => ['altText' => 'Image', 'fileUrl' => sb_isset($shortcode, 'image' . $suffix), 'forceRefresh' => false]], 'suggestions' => $suggestions]);
                    } else $index = false;
                }
                $rich_message = $slider ? ['fallback' => trim($fallback), 'richCard' => ['carouselCard' => ['cardWidth' => 'MEDIUM', 'cardContents' => $cards]]] : ['fallback' => $fallback, 'richCard' => ['standaloneCard' => ['cardContent' => $cards[0]]]];
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
                        $message .= PHP_EOL . '• ' . trim($value[$index]) . ' - ' . trim($value[$index + 1]);
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
                $suggestions = [];
                $count = count($values);
                if ($count > 13) $count = 13;
                for ($i = 0; $i < $count; $i++) {
                    $text = sb_($values[$i]);
                    array_push($suggestions, ['reply' => ['text' => $text, 'postbackData' => $text, ]]);
                    $fallback .= PHP_EOL . $text;
                }
                $rich_message = ['fallback' => $fallback, 'suggestions' => $suggestions, 'text' => $message];
                if ($shortcode_id == 'sb-human-takeover' && defined('SB_DIALOGFLOW')) sb_dialogflow_set_active_context('human-takeover', [], 2, false, sb_isset($extra, 'user_id'));
                break;
            case 'button':
                $message .= PHP_EOL . '[**' . $shortcode['name'] . '**](' . $shortcode['link'] . ')';
                $fallback = $shortcode['link'];
                $message = trim($message);
                break;
            case 'video':
                $link = ($shortcode['type'] == 'youtube' ? 'https://www.youtube.com/watch?v=' : 'https://vimeo.com/') . $shortcode['id'];
                $message .= PHP_EOL . '[**' . $link . '**](' . $link . ')';
                $fallback = $link;
                $message = trim($message);
                break;
            case 'image':
                $rich_message = ['fallback' => $shortcode['url'], 'image' => ['contentInfo' => ['altText' => 'Image', 'fileUrl' => $shortcode['url'], 'forceRefresh' => false]]];
                break;
            case 'articles':
                $message .= PHP_EOL . '[**' . $shortcode['link'] . '**](' . $shortcode['link'] . ')';
                $fallback = $shortcode['link'];
                $message = trim($message);
                break;
            case 'rating':
                if (defined('SB_DIALOGFLOW')) sb_dialogflow_set_active_context('rating', [], 2, false, sb_isset($extra, 'user_id'));
                break;
        }
    }
    return $rich_message ? $rich_message : ['text' => $message, 'fallback' => $fallback];
}

function sb_gbm_get_token() {
    $now = time();
    $data = sb_gbm_base64_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])) . '.' . sb_gbm_base64_encode(json_encode(['iss' => sb_get_multi_setting('gbm', 'gbm-client-email'), 'scope' => 'https://www.googleapis.com/auth/businessmessages', 'aud' => 'https://www.googleapis.com/oauth2/v4/token', 'exp' => $now + 3600, 'iat' => $now]));
    $private_key = str_replace('\n', PHP_EOL, sb_get_multi_setting('gbm', 'gbm-private-key'));
    $empty = '';
    openssl_sign($data, $empty, $private_key, 'SHA256');
    $query = json_encode(['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $data . '.' . sb_gbm_base64_encode($empty)]);
    $response = sb_curl('https://oauth2.googleapis.com/token', $query, ['Content-Type: application/x-www-url-encoded', 'Content-Length: ' . strlen($query)]);
    return sb_isset($response, 'access_token', $response);
}

function sb_gbm_get_conversation_id($user_id, $department = false) {
    return sb_isset(sb_db_get('SELECT id FROM sb_conversations WHERE source = "bm" AND user_id = ' . $user_id . ($department ? ' AND department = ' . sb_db_escape($department, true) : '') . ' ORDER BY id DESC LIMIT 1'), 'id');
}

function sb_gbm_base64_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

?>
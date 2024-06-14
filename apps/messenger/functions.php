<?php

/*
 * ==========================================================
 * MESSENGER APP
 * ==========================================================
 *
 * Facebook Messenger app main file. © 2017-2023 board.support. All rights reserved.
 *
 * 1. Send a message to the Facebook user in Messenger
 * 2. Convert Support Board rich messages to Messenger rich messages
 * 3. Get the details of a Facebook user and add it to Support Board
 * 4. Get the details of a Facebook page
 * 5. Receive and process the messages from Facebook Messenger forwarded by board.support
 * 6. Set typing status
 *
 */

define('SB_MESSENGER', '1.1.2');

function sb_messenger_send_message($psid, $facebook_page_id, $message = '', $attachments = [], $metadata = false) {
    if (empty($message) && empty($attachments)) {
        return sb_error('missing-arguments', 'sb_messenger_send_message');
    }
    $response = [];
    $user = sb_get_user_by('facebook-id', $psid);
    $page = sb_messenger_get_page($facebook_page_id);
    $instagram = sb_isset(sb_db_get('SELECT source FROM sb_conversations WHERE user_id = ' . sb_db_escape($user['id'], true) . ' ORDER BY id DESC LIMIT 1'), 'source') == 'ig';
    if ($page) {

        // Message
        $data = ['messaging_type' => 'RESPONSE', 'recipient' => ['id' => $psid], 'message' => []];
        if (!empty($message)) {
            if ($instagram) {
                $message = sb_clear_text_formatting($message);
            }
            if (mb_strlen($message) > 1000) {
                $message = mb_substr($message, 0, 1000);
            }
            $message = sb_messenger_rich_messages($message, ['user_id' => $user['id'], 'instagram' => $instagram]);
            if ($message[0] || $message[1]) {
                $data['message']['text'] = $message[0];
                $data['message'] = array_merge($data['message'], $message[1]);
                $data['message']['metadata'] = $metadata;
                array_push($response, sb_curl('https://graph.facebook.com/me/messages?access_token=' . $page['messenger-page-token'], $data));
            } else if (isset($message[2]['attachments'])) {
                $attachments = $message[2]['attachments'];
            }
        }

        // Attachments
        if (!empty($attachments) && is_array($attachments)) {
            for ($y = 0; $y < count($attachments); $y++) {
                $attachment = $attachments[$y];
                $attachment_type = false;
                switch (strtolower(pathinfo($attachment[1], PATHINFO_EXTENSION))) {
                    case 'gif':
                    case 'jpeg':
                    case 'jpg':
                    case 'png':
                        $attachment_type = 'image';
                        break;
                    case 'mp4':
                    case 'mov':
                    case 'avi':
                    case 'mkv':
                    case 'wmv':
                        $attachment_type = 'video';
                        break;
                    case 'mp3':
                    case 'aac':
                    case 'wav':
                    case 'flac':
                        $attachment_type = 'audio';
                        break;
                    default:
                        $attachment_type = 'file';
                }
                $response_attchment = sb_curl('https://graph.facebook.com/me/messages?access_token=' . $page['messenger-page-token'], ['messaging_type' => 'RESPONSE', 'recipient' => ['id' => $psid], 'message' => ['attachment' => ['type' => $attachment_type, 'payload' => ['url' => str_replace(' ', '%20', $attachment[1]), 'is_reusable' => true]], 'metadata' => $metadata, 'text' => '']]);
                if (!isset($response_attchment['error']) || sb_isset($response_attchment['error'], 'error_subcode') != 2534015) {
                    array_push($response, $response_attchment);
                }
            }
        }
        return $response;
    }
    return sb_error('facebook-page-not-found', 'sb_messenger_send_message');
}

function sb_messenger_rich_messages($message, $extra = false) {
    $shortcode = sb_get_shortcode($message);
    $facebook = [];
    $extra_values = [];
    $instagram = $extra['instagram'];
    if ($shortcode) {
        $shortcode_id = sb_isset($shortcode, 'id', '');
        $shortcode_name = $shortcode['shortcode_name'];
        $message = trim(str_replace($shortcode['shortcode'], '', $message) . (isset($shortcode['title']) ? ($instagram ? sb_($shortcode['title']) : (' *' . sb_($shortcode['title']) . '*')) : '') . PHP_EOL . sb_(sb_isset($shortcode, 'message', '')));
        switch ($shortcode_name) {
            case 'slider-images':
                $extra_values = explode(',', $shortcode['images']);
                for ($i = 0; $i < count($extra_values); $i++) {
                    $extra_values[$i] = [$extra_values[$i], $extra_values[$i]];
                }
                $extra_values = ['attachments' => $extra_values];
                $facebook = false;
                $message = false;
                break;
            case 'slider':
            case 'card':
                $elements = [];
                if ($shortcode_name == 'card') {
                    $elements = [['title' => sb_($shortcode['header']), 'subtitle' => sb_(sb_isset($shortcode, 'description', '')) . (isset($shortcode['extra']) ? (PHP_EOL . $shortcode['extra']) : ''), 'image_url' => $shortcode['image'], 'buttons' => [['type' => 'web_url', 'url' => $shortcode['link'], 'title' => sb_($shortcode['link-text'])]]]];
                } else {
                    $index = 1;
                    while ($index) {
                        if (isset($shortcode['header-' . $index])) {
                            array_push($elements, ['title' => sb_($shortcode['header-' . $index]), 'subtitle' => sb_(sb_isset($shortcode, 'description-' . $index, '')) . (isset($shortcode['extra-' . $index]) ? (PHP_EOL . $shortcode['extra-' . $index]) : ''), 'image_url' => $shortcode['image-' . $index], 'buttons' => [['type' => 'web_url', 'url' => $shortcode['link-' . $index], 'title' => sb_($shortcode['link-text-' . $index])]]]);
                            $index++;
                        } else
                            $index = false;
                    }
                }
                $facebook = ['attachment' => ['type' => 'template', 'payload' => ['template_type' => 'generic', 'elements' => $elements]]];
                $message = '';
                break;
            case 'select':
            case 'buttons':
            case 'chips':
                $values = explode(',', $shortcode['options']);
                if ($instagram) {
                    for ($i = 0; $i < count($values); $i++) {
                        $message .= PHP_EOL . '• ' . sb_($values[$i]);
                    }
                } else {
                    $facebook = ['quick_replies' => []];
                    for ($i = 0; $i < count($values); $i++) {
                        array_push($facebook['quick_replies'], ['content_type' => 'text', 'title' => sb_($values[$i]), 'payload' => $shortcode_id]);
                    }
                }
                if ($shortcode_id == 'sb-human-takeover' && defined('SB_DIALOGFLOW'))
                    sb_dialogflow_set_active_context('human-takeover', [], 2, false, sb_isset($extra, 'user_id'));
                break;
            case 'inputs':
                $values = explode(',', $shortcode['values']);
                for ($i = 0; $i < count($values); $i++) {
                    $message .= PHP_EOL . '• ' . sb_($values[$i]);
                }
                break;
            case 'email':
                $facebook = ['quick_replies' => [['content_type' => 'user_email', 'payload' => $shortcode_id]]];
                if (sb_isset($shortcode, 'phone'))
                    $extra_values = 'phone';
                break;
            case 'phone':
                $facebook = ['quick_replies' => [['content_type' => 'user_phone_number', 'payload' => $shortcode_id]]];
                break;
            case 'button':
                if ($message) {
                    $facebook = ['attachment' => ['type' => 'template', 'payload' => ['template_type' => 'button', 'text' => $message, 'buttons' => [['type' => 'web_url', 'url' => $shortcode['link'], 'title' => sb_($shortcode['name'])]]]]];
                    $message = '';
                } else {
                    $message = $shortcode['link'];
                }
                break;
            case 'video':
                $message = ($shortcode['type'] == 'youtube' ? 'https://www.youtube.com/embed/' : 'https://player.vimeo.com/video/') . $shortcode['id'];
                break;
            case 'image':
                $extra_values = ['attachments' => [[$shortcode['url'], $shortcode['url']]]];
                $facebook = false;
                $message = false;
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
                        $message .= PHP_EOL . '• *' . trim($value[$index]) . '* ' . trim($value[$index + 1]);
                    }
                } else {
                    for ($i = 0; $i < count($values); $i++) {
                        $message .= PHP_EOL . '• ' . trim($values[$i]);
                    }
                }
                $message = trim($message);
                break;
            case 'rating':
                if (!$instagram) {
                    $facebook = ['attachment' => ['type' => 'template', 'payload' => ['template_type' => 'button', 'text' => $message, 'buttons' => [['type' => 'postback', 'title' => sb_($shortcode['label-positive']), 'payload' => 'rating-positive'], ['type' => 'postback', 'title' => sb_($shortcode['label-negative']), 'payload' => 'rating-negative']]]]];
                    $message = '';
                }
                if (defined('SB_DIALOGFLOW'))
                    sb_dialogflow_set_active_context('rating', [], 2, false, sb_isset($extra, 'user_id'));
                break;
            case 'articles':
                if (isset($shortcode['link'])) {
                    $message = $shortcode['link'];
                } else {
                    $facebook = false;
                    $message = '';
                }
                break;
            default:
                $facebook = false;
                $message = '';
        }
    }
    return [$message, $facebook, $extra_values];
}

function sb_messenger_add_user($user_id, $token, $user_type = 'lead', $instagram = false, $message = false) {
    $user_details = sb_get('https://graph.facebook.com/' . $user_id . ($instagram ? '?fields=name,profile_pic' : '?fields=first_name,last_name') . '&access_token=' . $token, true);
    if (sb_is_error($user_details))
        return $user_details;
    $profile_image = $instagram ? $user_details['profile_pic'] : sb_isset(sb_isset(sb_get('https://graph.facebook.com/' . $user_id . '/picture?redirect=false&width=600&height=600&access_token=' . $token, true), 'data'), 'url');
    if ($profile_image) {
        $profile_image = sb_download_file($profile_image, $user_id . '.jpg');
        $user_details['profile_image'] = sb_is_error($profile_image) || empty($profile_image) ? '' : $profile_image;
    }
    if (isset($user_details['name']))
        $user_details['first_name'] = $user_details['name'];
    $user_details['user_type'] = $user_type;
    $extra = ['facebook-id' => [$user_id, 'Facebook ID']];
    if (defined('SB_DIALOGFLOW'))
        $extra['language'] = sb_google_language_detection_get_user_extra($message);
    return sb_add_user($user_details, $extra);
}

function sb_messenger_get_page($page_id) {
    $facebook_pages = sb_get_setting('messenger-pages', []);
    if (is_array($facebook_pages)) {
        for ($i = 0; $i < count($facebook_pages); $i++) {
            if ($facebook_pages[$i]['messenger-page-id'] == $page_id || sb_isset($facebook_pages[$i], 'messenger-instagram-id') == $page_id) {
                return $facebook_pages[$i];
            }
        }
    }
    return false;
}

function sb_messenger_set_typing($user_id, $page_id = false, $token = false) {
    if ($page_id)
        $token = sb_isset(sb_messenger_get_page($page_id), 'messenger-page-token');
    return $token ? sb_curl('https://graph.facebook.com/me/messages?access_token=' . $token, ['recipient' => ['id' => $user_id], 'sender_action' => 'typing_on']) : false;
}

?>
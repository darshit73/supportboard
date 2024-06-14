<?php

/*
 * ==========================================================
 * WHATSAPP APP POST FILE
 * ==========================================================
 *
 * WhatsApp app post file to receive messages sent by Twilio. © 2017-2023 board.support. All rights reserved.
 *
 */

if (isset($_GET['hub_mode']) && $_GET['hub_mode'] == 'subscribe') {
    require('../../include/functions.php');
    sb_cloud_load_by_url();
    if ($_GET['hub_verify_token'] == sb_get_multi_setting('whatsapp-cloud', 'whatsapp-cloud-key')) {
        echo $_GET['hub_challenge'];
    }
    die();
}
$raw = file_get_contents('php://input');
flush();
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}
if ($raw) {
    require('../../include/functions.php');
    sb_cloud_load_by_url();
    $twilio = !empty(sb_get_multi_setting('whatsapp-twilio', 'whatsapp-twilio-user'));
    $response = [];
    if ($twilio) {
        $items = explode('&', urldecode($raw));
        for ($i = 0; $i < count($items); $i++) {
            $value = explode('=', $items[$i]);
            $response[$value[0]] = str_replace('\/', '/', $value[1]);
        }
    } else {
        $response = json_decode($raw, true);
        if (isset($response['entry']) && isset($response['entry'][0]['changes'])) {
            $response = $response['entry'][0]['changes'][0]['value'];
        }
    }
    $error = $twilio ? sb_isset($response, 'ErrorCode') : (isset($response['statuses']) && is_array($response['statuses']) && count($response['statuses']) && isset($response['statuses'][0]['errors']) ? $response['statuses'][0]['errors'][0]['code'] : false);
    if (($twilio && isset($response['From']) && !$error) || (!$twilio && isset($response['messages']))) {
        if ($twilio && (!isset($response['Body']) && !isset($response['MediaContentType0']))) {
            die();
        }
        $GLOBALS['SB_FORCE_ADMIN'] = true;
        $user_id = false;
        $conversation_id = false;
        $phone = $twilio ? str_replace('whatsapp:', '', $response['From']) : '+' . $response['contacts'][0]['wa_id'];
        $user = sb_get_user_by('phone', $phone);
        $phone_number_id = isset($response['metadata']) ? sb_isset($response['metadata'], 'phone_number_id') : false;
        $department = sb_whatsapp_cloud_get_token($phone_number_id, true);
        $payload = '';
        $message = '';
        $new_conversation = false;
        if ($phone_number_id) {
            $phone_number_ids = [sb_get_multi_setting('whatsapp-cloud', 'whatsapp-cloud-phone-id')];
            $phone_number_ids_2 = sb_get_setting('whatsapp-cloud-numbers', []);
            for ($i = 0; $i < count($phone_number_ids_2); $i++) {
                array_push($phone_number_ids, $phone_number_ids_2[$i]['whatsapp-cloud-numbers-phone-id']);
            }
            if (count($phone_number_ids) && !in_array($phone_number_id, $phone_number_ids)) {
                die();
            }
        }
        if ($twilio) {
            $message = $response['Body'];
        } else {
            $message_2 = $response['messages'][0];
            $message_type = $message_2['type'];
            if ($message_type == 'button') {
                $message = $message_2['button']['text'];
                $message_type = 'text';
            } else if ($message_type == 'text') {
                $message = $message_2['text']['body'];
            }
            $payload = json_encode(['waid' => $message_2['id']]);
        }

        // User and conversation
        if (!$user) {
            $name = sb_split_name($twilio ? $response['ProfileName'] : $response['contacts'][0]['profile']['name']);
            $extra = ['phone' => [$phone, 'Phone']];
            if (defined('SB_DIALOGFLOW')) {
                $extra['language'] = sb_google_language_detection_get_user_extra($message);
            }
            $user_id = sb_add_user(['first_name' => $name[0], 'last_name' => $name[1], 'user_type' => 'user'], $extra);
            $user = sb_get_user($user_id);
        } else {
            $user_id = $user['id'];
            $conversation_id = sb_whatsapp_get_conversation_id($user_id, $phone_number_id);
        }
        $GLOBALS['SB_LOGIN'] = $user;
        if (!$conversation_id) {
            $conversation_id = sb_isset(sb_new_conversation($user_id, 2, '', $department, -1, 'wa', $phone_number_id), 'details', [])['id'];
            $new_conversation = true;
        } else if ($payload && sb_isset(sb_db_get('SELECT COUNT(*) AS `count` FROM sb_messages WHERE conversation_id =  ' . $conversation_id . ' AND payload LIKE "%' . sb_db_escape($payload) . '%"'), 'count') != 0) {
            die();
        }

        // Attachments
        $attachments = [];
        if ($twilio) {
            $extension = sb_isset($response, 'MediaContentType0');
            if ($extension) {
                $extension = sb_whatsapp_get_extension($extension);
                if ($extension) {
                    $file_name = basename($response['MediaUrl0']) . $extension;
                    array_push($attachments, [$file_name, sb_download_file($response['MediaUrl0'], $file_name)]);
                }
            }
        } else if ($message_type != 'text') {
            $file_data = $message_2[$message_type];
            switch ($message_type) {
                case 'reaction':
                    $message = $file_data['emoji'];
                    break;
                case 'contacts':
                    for ($i = 0; $i < count($file_data); $i++) {
                        $message .= $file_data[$i]['phones'][0]['phone'] . PHP_EOL;
                    }
                    break;
                case 'interactive':
                    $message = $file_data[$file_data['type']]['title'];
                    break;
                case 'order':
                    $total = 0;
                    $products = $file_data['product_items'];
                    for ($i = 0; $i < count($products); $i++) {
                        $price = intval($products[$i]['item_price']);
                        $quantity = intval($products[$i]['quantity']);
                        $message .= '*' . $price . $products[$i]['currency'] . '* ' . $products[$i]['product_retailer_id'] . ($quantity > 1 ? ' __x' . $quantity . '__' : '') . PHP_EOL;
                        $total += $price;
                    }
                    $message = '`' . sb_('New order') . '` ' . $products[0]['currency'] . ' ' . $total . PHP_EOL . $message;
                    $url = sb_get_setting('whatsapp-order-webhook');
                    if ($url) {
                        sb_curl($url, $raw, ['Content-Type: application/json', 'Content-Length: ' . strlen($raw)]);
                    }
                    if (defined('SB_WOOCOMMERCE')) {
                        $woocommerce_wa_carts = sb_get_external_setting('wc-whatsapp-carts', []);
                        $products['expiration'] = time() + 2600000;
                        $woocommerce_wa_carts[trim(str_replace('+', '', $phone))] = $products;
                        sb_save_external_setting('wc-whatsapp-carts', $woocommerce_wa_carts);
                    }
                    break;
                default:
                    $sticker = $message_type == 'sticker';
                    $mime = sb_isset($file_data, 'mime_type');
                    $file_name = sb_isset($file_data, 'filename', $file_data['id']) . ($mime == 'audio/ogg; codecs=opus' ? '.ogg' : ($sticker ? '.webp' : ''));
                    $key_360 = sb_get_multi_setting('whatsapp-360', 'whatsapp-360-key');
                    if ($key_360) {
                        $url = sb_download_file('https://waba.360dialog.io/v1/media/' . $file_data['id'], rand(9999999, 99999999999) . '_' . $file_name, $mime, ['D360-API-KEY: ' . $key_360]);
                    } else {
                        $media_url = sb_isset(sb_whatsapp_cloud_curl($file_data['id'], false, $phone_number_id, 'GET'), 'url');
                        if ($media_url) {
                            $url = sb_download_file($media_url, ($sticker ? 'sticker_' : '') . rand(9999999, 99999999999) . '_' . $file_name, $mime, ['Authorization: Bearer ' . sb_whatsapp_cloud_get_token($phone_number_id)]);
                        }
                    }
                    array_push($attachments, [basename($url), $url]);
                    if (isset($file_data['caption']) && $file_data['caption'] != $file_name)
                        $message = $file_data['caption'];
            }
        }

        // Send message
        $response = sb_send_message($user_id, $conversation_id, $message, $attachments, false, $payload);

        // Dialogflow, Notifications, Bot messages
        $response_extarnal = sb_messaging_platforms_functions($conversation_id, $message, $attachments, $user, ['source' => 'wa', 'platform_value' => $phone, 'new_conversation' => $new_conversation, 'extra' => $phone_number_id]);

        // Queue
        if (sb_get_multi_setting('queue', 'queue-active')) {
            sb_queue($conversation_id, $department);
        }

        // Online status
        sb_update_users_last_activity($user_id);

        $GLOBALS['SB_FORCE_ADMIN'] = false;
    } else if ($error === 470 || $error == 131047) {
        if (!$twilio) {
            $response = $response['statuses'][0];
        }
        $phone = $twilio ? str_replace('whatsapp:', '', $response['To']) : $response['recipient_id'];
        $user = sb_get_user_by('phone', $phone);
        if (!isset($response['ErrorMessage']) && isset($response['MessageStatus'])) {
            $response['ErrorMessage'] = $response['MessageStatus'];
        }
        if ($user) {
            $agents_ids = sb_get_agents_ids();
            $message = sb_db_get('SELECT id, message, attachments, conversation_id FROM sb_messages WHERE user_id IN (' . implode(',', $agents_ids) . ') AND conversation_id IN (SELECT id FROM sb_conversations WHERE source = "wa" AND user_id = ' . $user['id'] . ') ORDER BY id DESC LIMIT 1');
            if ($message) {
                $GLOBALS['SB_FORCE_ADMIN'] = true;
                $conversation_id = $message['conversation_id'];
                $user_language = sb_get_user_language($user['id']);
                $user_name = sb_get_user_name($user);
                $user_email = sb_isset($user, 'email', '');
                $conversation_url_parameter = $conversation_id && $user ? ('?conversation=' . $conversation_id . '&token=' . $user['token']) : '';

                // SMS
                if (sb_get_multi_setting('whatsapp-sms', 'whatsapp-sms-active')) {
                    $template = sb_get_multi_setting('whatsapp-sms', 'whatsapp-sms-template');
                    $message_sms = $template ? str_replace('{message}', $message['message'], sb_t($template, $user_language)) : $message['message'];
                    $message_sms = str_replace(['{conversation_url_parameter}', '{recipient_name}', '{recipient_email}'], [$conversation_url_parameter, $user_name, $user_email], $message_sms);
                    $response_sms = sb_send_sms($message_sms, $phone, false, $conversation_id, empty($message['attachments']) ? [] : json_decode($message['attachments']));
                    if ($response_sms['status'] == 'sent' || $response_sms['status'] == 'queued') {
                        $response = ['whatsapp-templates' => true];
                    }
                }

                // WhatsApp Template
                $phone_number_id = $conversation_id && !$twilio && is_array(sb_get_setting('whatsapp-cloud-numbers')) ? sb_isset(sb_db_get('SELECT extra FROM sb_conversations WHERE id = ' . sb_db_escape($conversation_id, true)), 'extra') : false;
                $response_template = sb_whatsapp_send_template($phone, $user_language, $conversation_url_parameter, $user_name, $user_email, false, $phone_number_id);
                if (($twilio && ($response_template['status'] == 'sent' || $response_template['status'] == 'queued')) || (!$twilio && $response_template && isset($response_template['messages']))) {
                    if (isset($response['whatsapp-templates'])) {
                        $response['whatsapp-template-fallback'] = true;
                    } else {
                        $response = ['whatsapp-template-fallback' => true];
                    }
                } else if (!$twilio && isset($response_template['errors'])) {
                    $response = ['ErrorCode' => true, 'ErrorMessage' => $response_template['errors'][0]['details']];
                }
                sb_update_message($message['id'], false, false, $response);
                $GLOBALS['SB_FORCE_ADMIN'] = false;
            }
        }
    }
}

function sb_whatsapp_get_conversation_id($user_id, $phone_number_id) {
    return sb_isset(sb_db_get('SELECT id FROM sb_conversations WHERE source = "wa" AND user_id = ' . $user_id . ($phone_number_id ? ' AND extra = "' . $phone_number_id . '"' : '') . ' ORDER BY id DESC LIMIT 1'), 'id');
}

function sb_whatsapp_get_extension($mime_type) {
    switch ($mime_type) {
        case 'video/mp4':
            return '.mp4';
        case 'image/gif':
            return '.gif';
        case 'image/png':
            return '.png';
        case 'image/jpg':
        case 'image/jpeg':
            return '.jpg';
        case 'image/webp':
            return '.webp';
        case 'audio/ogg':
            return '.ogg';
        case 'audio/mpeg':
            return '.mp3';
        case 'audio/amr':
            return '.amr';
        case 'application/pdf':
            return '.pdf';
    }
    return false;
}

die();

?>
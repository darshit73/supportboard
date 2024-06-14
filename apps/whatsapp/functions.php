<?php

/*
 * ==========================================================
 * WHATSAPP APP
 * ==========================================================
 *
 * WhatsApp app main file. © 2017-2023 board.support. All rights reserved.
 *
 */

define('SB_WHATSAPP', '1.1.8');

function sb_whatsapp_send_message($to, $message = '', $attachments = [], $phone_number_id = false) {
    if (empty($message) && empty($attachments)) {
        return false;
    }
    $twilio = !empty(sb_get_multi_setting('whatsapp-twilio', 'whatsapp-twilio-user'));
    $cloud_phone_id = $twilio ? false : ($phone_number_id ? $phone_number_id : sb_get_multi_setting('whatsapp-cloud', 'whatsapp-cloud-phone-id'));
    $to = trim(str_replace('+', '', $to));
    $user = sb_get_user_by('phone', $to);
    $response = false;
    $merge_field = false;
    $merge_field_checkout = false;

    // Security
    if (!sb_is_agent() && !sb_is_agent($user) && sb_get_active_user_ID() != sb_isset($user, 'id') && empty($GLOBALS['SB_FORCE_ADMIN'])) {
        return sb_error('security-error', 'sb_whatsapp_send_message');
    }

    // Send the message
    if (is_string($message) && $user) {
        $message = sb_whatsapp_rich_messages($message, ['user_id' => $user['id']]);
        if ($message[1]) {
            $attachments = $message[1];
        }
        $message = $message[0];
        if (is_string($message)) {
            $merge_field = sb_get_shortcode($message, 'catalog', true);
            $merge_field_checkout = sb_get_shortcode($message, 'catalog_checkout', true);
        }
    }
    $attachments_count = $attachments ? count($attachments) : 0;
    if ($twilio) {
        $supported_mime_types = ['jpg', 'jpeg', 'png', 'pdf', 'mp3', 'ogg', 'amr', 'mp4'];
        $query = ['Body' => $message, 'To' => 'whatsapp:+' . $to];
        if ($attachments_count) {
            if (in_array(strtolower(sb_isset(pathinfo($attachments[0][1]), 'extension')), $supported_mime_types)) {
                $query['MediaUrl'] = str_replace(' ', '%20', $attachments[0][1]);
            } else {
                $query['Body'] .= PHP_EOL . PHP_EOL . $attachments[0][1];
            }
        }
        $response = sb_whatsapp_twilio_curl($query, '/Messages.json');
        if ($attachments_count > 1) {
            $query['Body'] = '';
            for ($i = 1; $i < $attachments_count; $i++) {
                if (in_array(strtolower(sb_isset(pathinfo($attachments[$i][1]), 'extension')), $supported_mime_types)) {
                    $query['MediaUrl'] = str_replace(' ', '%20', $attachments[$i][1]);
                } else {
                    $query['Body'] = $attachments[$i][1];
                }
                $response = sb_whatsapp_twilio_curl($query, '/Messages.json');
            }
        }
    } else {
        if ($message) {
            $query = ['messaging_product' => 'whatsapp', 'recipient_type' => 'individual', 'to' => $to];
            if (is_string($message)) {
                if ($merge_field_checkout) {
                    $query['type'] = 'text';
                    $query['text'] = ['body' => str_replace('{catalog_checkout}', sb_woocommerce_get_url('cart') . '?sbwa=' . sb_encryption($to), $message)];
                } else if ($merge_field) {
                    $query['type'] = 'interactive';
                    if (isset($merge_field['product_id'])) {
                        $query['interactive'] = ['type' => 'product', 'action' => ['catalog_id' => $merge_field['id'], 'product_retailer_id' => $merge_field['product_id']]];
                    } else {
                        $continue = true;
                        $index = 1;
                        $sections = [];
                        $query['interactive'] = ['type' => 'product_list', 'action' => ['catalog_id' => $merge_field['id']], 'header' => ['text' => $merge_field['header'], 'type' => 'text']];
                        while ($continue) {
                            if (isset($merge_field['section_' . $index])) {
                                $continue_2 = true;
                                $index_2 = 1;
                                $products = [];
                                while ($continue_2) {
                                    $id = 'product_id_' . $index . '_' . $index_2;
                                    if (isset($merge_field[$id])) {
                                        array_push($products, ['product_retailer_id' => $merge_field[$id]]);
                                        $index_2++;
                                    } else {
                                        array_push($sections, ['title' => $merge_field['section_' . $index], 'product_items' => $products]);
                                        $continue_2 = false;
                                    }
                                }
                                $index++;
                            } else {
                                $query['interactive']['action']['sections'] = $sections;
                                $continue = false;
                            }
                        }
                    }
                    if (isset($merge_field['body'])) {
                        $query['interactive']['body'] = ['text' => $merge_field['body']];
                    }
                    if (isset($merge_field['footer'])) {
                        $query['interactive']['footer'] = ['text' => $merge_field['footer']];
                    }
                } else {
                    $query['type'] = 'text';
                    $query['text'] = ['body' => $message];
                }
            } else {
                $query = array_merge($query, $message);
            }
            $response = $cloud_phone_id ? sb_whatsapp_cloud_curl($cloud_phone_id . '/messages', $query, $phone_number_id) : sb_whatsapp_360_curl('messages', $query);
        }
        for ($i = 0; $i < $attachments_count; $i++) {
            $link = $attachments[$i][1];
            $media_type = 'document';
            switch (strtolower(sb_isset(pathinfo($link), 'extension'))) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                    $media_type = 'image';
                    break;
                case 'mp4':
                case '3gpp':
                    $media_type = 'video';
                    break;
                case 'aac':
                case 'amr':
                case 'mpeg':
                    $media_type = 'audio';
                    break;
            }
            $query = ['messaging_product' => 'whatsapp', 'recipient_type' => 'individual', 'to' => $to, 'type' => $media_type];
            $query[$media_type] = ['link' => $link, 'caption' => $media_type == 'document' ? $attachments[$i][0] : ''];
            $response_2 = $cloud_phone_id ? sb_whatsapp_cloud_curl($cloud_phone_id . '/messages', $query, $phone_number_id) : sb_whatsapp_360_curl('messages', $query);
            if (!$response) {
                $response = $response_2;
            }
        }
    }
    return $response;
}

function sb_whatsapp_send_template($phone, $user_language = '', $conversation_url_parameter = '', $user_name = '', $user_email = '', $template_name = false, $phone_number_id = false, $parameters = false, $template_languages = false) {
    switch (sb_whatsapp_provider()) {
        case 'twilio':
            $template = $template_name ? str_replace('<>', '"', $template_name) : sb_get_setting('whatsapp-template');
            if ($template) {
                $parameters[1] = explode(',', $parameters[1]);
                for ($i = 0; $i < count($parameters[1]); $i++) {
                    $template = str_replace('{{' . ($i + 1) . '}}', trim($parameters[1][$i]), $template);
                }
                return sb_whatsapp_send_message($phone, str_replace(['{conversation_url_parameter}', '{recipient_name}', '{recipient_email}'], [$conversation_url_parameter, $user_name, $user_email], sb_t($template, $user_language)), [], $phone_number_id);
            }
            break;
        case '360':
            $settings = sb_get_setting('whatsapp-template-360');
            if ($settings && !empty($settings['whatsapp-template-360-namespace'])) {
                $template = sb_whatsapp_360_templates($template_name ? $template_name : $settings['whatsapp-template-360-name'], $user_language);
                if ($template) {
                    $merge_fields = explode(',', str_replace(' ', '', $settings['whatsapp-template-360-parameters']));
                    $parameters_return = [];
                    $index = 0;
                    $components = sb_isset($template, 'components', []);
                    for ($i = 0; $i < count($components); $i++) {
                        switch (strtolower($components[$i]['type'])) {
                            case 'body':
                                $count = substr_count($components[$i]['text'], '{{');
                                if ($count) {
                                    $parameters_sub = [];
                                    for ($j = 0; $j < $count; $j++) {
                                        array_push($parameters_sub, sb_whatsapp_create_template_parameter('text', $merge_fields[$index], $conversation_url_parameter, $user_name, $user_email));
                                        $index++;
                                    }
                                    array_push($parameters_return, ['type' => 'body', 'parameters' => $parameters_sub]);
                                }
                                break;
                            case 'buttons':
                                $buttons = $components[$i]['buttons'];
                                for ($j = 0; $j < count($buttons); $j++) {
                                    $key = strtolower($buttons[$j]['type']) == 'url' ? 'url' : 'text';
                                    $count = substr_count($buttons[$j][$key], '{{');
                                    if ($count) {
                                        array_push($parameters_return, ['type' => 'button', 'sub_type' => $key, 'index' => $j, 'parameters' => [sb_whatsapp_create_template_parameter('text', $merge_fields[$index], $conversation_url_parameter, $user_name, $user_email)]]);
                                        $index++;
                                    }
                                }
                                break;
                            case 'header':
                                $format = strtolower($components[$i]['format']);
                                $parameter = ['type' => $format];
                                if ($format == 'text') {
                                    $parameter = sb_whatsapp_create_template_parameter('text', $merge_fields[$index], $conversation_url_parameter, $user_name, $user_email);
                                } else {
                                    $parameter[$format] = ['link' => $components[$i]['example']['header_handle'][0]];
                                }
                                array_push($parameters_return, ['type' => 'header', 'parameters' => [$parameter]]);
                                break;
                        }
                    }
                    $query = ['type' => 'template', 'template' => ['namespace' => $settings['whatsapp-template-360-namespace'], 'language' => ['policy' => 'deterministic', 'code' => $template['language']], 'name' => $template['name'], 'components' => $parameters_return]];
                    return sb_whatsapp_send_message($phone, $query);
                }
            }
            break;
        case 'official':
            $settings = sb_get_setting('whatsapp-template-cloud');
            $template_languages = explode(',', str_replace(' ', '', $template_languages ? $template_languages : $settings['whatsapp-template-cloud-languages']));
            $template_language = false;
            for ($i = 0; $i < count($template_languages); $i++) {
                if (substr($template_languages[$i], 0, 2) == $user_language) {
                    $template_language = $template_languages[$i];
                    break;
                }
            }
            if (!$template_language) {
                $template_language = $template_languages[0];
            }
            $query = ['type' => 'template', 'template' => ['name' => $template_name ? $template_name : $settings['whatsapp-template-cloud-name'], 'language' => ['code' => $template_language]]];
            $parameter_sections = [$parameters && isset($parameters[0]) ? $parameters[0] : $settings['whatsapp-template-cloud-parameters-header'], $parameters && isset($parameters[1]) ? $parameters[1] : $settings['whatsapp-template-cloud-parameters-body']];
            $components = [];
            for ($i = 0; $i < 2; $i++) {
                if ($parameter_sections[$i]) {
                    $parameters_auto = explode(',', trim(str_replace(['{conversation_url_parameter}', '{recipient_name}', '{recipient_email}'], [$conversation_url_parameter, $user_name, $user_email], $parameter_sections[$i])));
                    $count = count($parameters_auto);
                    if ($count) {
                        for ($j = 0; $j < $count; $j++) {
                            $parameters_auto[$j] = ['type' => 'text', 'text' => $parameters_auto[$j]];
                        }
                        array_push($components, ['type' => $i ? 'body' : 'header', 'parameters' => $parameters_auto]);
                    }
                }
            }
            if (count($components)) {
                $query['template']['components'] = $components;
            }
            return sb_whatsapp_send_message($phone, $query, $phone_number_id);
    }
    return false;
}

function sb_whatsapp_rich_messages($message, $extra = false) {
    $shortcode = sb_get_shortcode($message);
    $attachments = false;
    if ($shortcode) {
        $shortcode_id = sb_isset($shortcode, 'id', '');
        $shortcode_name = $shortcode['shortcode_name'];
        $message = trim(str_replace($shortcode['shortcode'], '', $message) . (isset($shortcode['title']) ? ' *' . sb_($shortcode['title']) . '*' : '') . PHP_EOL . sb_(sb_isset($shortcode, 'message', '')));
        $twilio = !empty(sb_get_multi_setting('whatsapp-twilio', 'whatsapp-twilio-user'));
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
                $is_slider = $shortcode_name == 'slider';
                $suffix = $is_slider ? '-1' : '';
                $message = '*' . sb_($shortcode['header' . $suffix]) . '*' . (isset($shortcode['description' . $suffix]) ? (PHP_EOL . $shortcode['description' . $suffix]) : '') . (isset($shortcode['extra' . $suffix]) ? (PHP_EOL . '```' . $shortcode['extra' . $suffix] . '```') : '') . (isset($shortcode['link' . $suffix]) ? (PHP_EOL . PHP_EOL . $shortcode['link' . $suffix]) : '');
                $attachments = [[$shortcode['image' . $suffix], $shortcode['image' . $suffix]]];
                $catalog_id = sb_isset($shortcode, 'whatsapp-catalog-id');
                $product_id = sb_isset($shortcode, 'product-id');
                if (!$twilio && $catalog_id && $product_id) {
                    $body = sb_isset($shortcode, 'message', '');
                    $message = '{catalog id="' . $catalog_id . '"';
                    if ($is_slider) {
                        $product_id = explode('|', $product_id);
                        $message .= ' header="' . sb_(sb_isset($shortcode, 'filters', sb_isset($shortcode, 'header', sb_get_multi_setting('whatsapp-catalog', 'whatsapp-catalog-head')))) . '" section_1="' . sb_(sb_get_setting('whatsapp-catalog-title', 'Shop')) . '"';
                        for ($i = 0; $i < count($product_id); $i++) {
                            $message .= ' product_id_1_' . ($i + 1) . '="' . $product_id[$i] . '"';
                        }
                        if (!$body)
                            $body = sb_isset($shortcode, 'filters', sb_get_multi_setting('whatsapp-catalog', 'whatsapp-catalog-body'));
                    } else {
                        $message .= ' product_id="' . $product_id . '"';
                    }
                    if ($body)
                        $message .= ' body="' . sb_($body) . '"';
                    $message .= '}';
                    $attachments = [];
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
                        $message .= PHP_EOL . '• *' . trim($value[$index]) . '* ' . trim($value[$index + 1]);
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
                $count = count($values);
                if ($twilio) {
                    $message .= PHP_EOL;
                    for ($i = 0; $i < $count; $i++) {
                        $message .= PHP_EOL . '• ' . trim($values[$i]);
                    }
                } else {
                    if ($count > 10)
                        $count = 10;
                    $is_buttons = $count < 4;
                    $message = ['type' => $is_buttons ? 'button' : 'list', 'body' => ['text' => sb_isset($shortcode, 'message')]];
                    if (!empty($shortcode['title'])) {
                        $message['header'] = ['type' => 'text', 'text' => $shortcode['title']];
                    }
                    $buttons = [];
                    for ($i = 0; $i < $count; $i++) {
                        $value = trim($values[$i]);
                        $item = ['id' => $value, 'title' => substr($value, 0, 20)];
                        array_push($buttons, $is_buttons ? ['type' => 'reply', 'reply' => $item] : $item);
                    }
                    $message['action'] = $is_buttons ? ['buttons' => $buttons] : ['button' => sb_(sb_isset($shortcode, 'whatsapp', 'Menu')), 'sections' => [['title' => substr(sb_isset($shortcode, 'title', $shortcode['message']), 0, 24), 'rows' => $buttons]]];
                    $message = ['type' => 'interactive', 'interactive' => $message];
                }
                if ($shortcode_id == 'sb-human-takeover' && defined('SB_DIALOGFLOW')) {
                    sb_dialogflow_set_active_context('human-takeover', [], 2, false, sb_isset($extra, 'user_id'));
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
                if (!$twilio) {
                    $message = ['type' => 'interactive', 'interactive' => ['type' => 'button', 'body' => ['text' => $shortcode['message']], 'action' => ['buttons' => [['type' => 'reply', 'reply' => ['id' => 'rating-positive', 'title' => sb_($shortcode['label-positive'])]], ['type' => 'reply', 'reply' => ['id' => 'rating-negative', 'title' => sb_($shortcode['label-negative'])]]]]]];
                    if (!empty($shortcode['title'])) {
                        $message['interactive']['header'] = ['type' => 'text', 'text' => $shortcode['title']];
                    }
                }
                if (defined('SB_DIALOGFLOW'))
                    sb_dialogflow_set_active_context('rating', [], 2, false, sb_isset($extra, 'user_id'));
                break;
            case 'articles':
                if (isset($shortcode['link']))
                    $message = $shortcode['link'];
                break;
        }
    }
    return [$message, $attachments];
}

function sb_whatsapp_360_synchronization($key = false, $cloud = '') {
    $response = sb_whatsapp_360_curl('configs/webhook', ['url' => SB_URL . '/apps/whatsapp/post.php' . str_replace(['&', '%26', '%3D'], ['?', '?', '='], $cloud)]);
    return sb_isset($response, 'meta', $response);
}

function sb_whatsapp_360_curl($url_part, $post_fields = false, $type = 'POST') {
    $key = sb_get_multi_setting('whatsapp-360', 'whatsapp-360-key');
    return sb_curl((strpos($key, 'sandbox') ? 'https://waba-sandbox.360dialog.io/v1/' : 'https://waba.360dialog.io/v1/') . $url_part, $post_fields ? json_encode($post_fields) : '', ['D360-API-KEY: ' . $key, 'Content-Type: application/json'], $type);
}

function sb_whatsapp_360_upload($link) {
    $path = substr($link, strrpos(substr($link, 0, strrpos($link, '/')), '/'));
    $response = sb_curl('https://waba.360dialog.io/v1/media', file_get_contents(sb_upload_path() . $path), ['D360-API-KEY: ' . sb_get_multi_setting('whatsapp-360', 'whatsapp-360-key')], 'UPLOAD');
    return isset($response['media']) ? $response['media'][0]['id'] : false;
}

function sb_whatsapp_360_templates($template_name = false, $template_language = false) {
    $templates = sb_isset(json_decode(sb_whatsapp_360_curl('configs/templates', false, 'GET'), true), 'waba_templates', []);
    if ($template_name) {
        $template = false;
        $default_language = sb_get_multi_setting('whatsapp-template-360', 'whatsapp-template-360-language');
        $template_language = substr(strtolower($template_language), 0, 2);
        for ($i = 0; $i < count($templates); $i++) {
            if ($templates[$i]['name'] == $template_name) {
                if (!$template_language)
                    return $templates[$i];
                $language = substr(strtolower($templates[$i]['language']), 0, 2);
                if ($language == $template_language) {
                    return $templates[$i];
                } else if ($language == $default_language) {
                    $template = $templates[$i];
                }
            }
        }
        return $template;
    }
    return $templates;
}

function sb_whatsapp_shop_url($sbwa) {
    $carts = sb_get_external_setting('wc-whatsapp-carts');
    $cart = sb_isset($carts, sb_encryption($sbwa, false));
    $update = false;
    $now = time();
    if ($cart) {
        for ($i = 0; $i < count($cart); $i++) {
            sb_woocommerce_update_cart($cart[$i]['product_retailer_id'], 'cart-add', $cart[$i]['quantity']);
        }
        header('Location: ' . wc_get_checkout_url());
    }
    for ($i = 0; $i < count($carts); $i++) {
        if ($now > $cart[$i]['expiration']) {
            array_splice($carts, $i, 1);
            $update = true;
        }
    }
    if ($update) {
        sb_save_external_setting('wc-whatsapp-carts', $carts);
    }
}

function sb_whatsapp_create_template_parameter($type, $text, $conversation_url_parameter, $user_name, $user_email) {
    $parameter = ['type' => $type];
    $parameter[$type] = str_replace(['{conversation_url_parameter}', '{recipient_name}', '{recipient_email}'], [$conversation_url_parameter, $user_name, $user_email], $text);
    if (!$parameter[$type]) {
        $parameter[$type] = '[]';
    }
    return $parameter;
}

function sb_whatsapp_cloud_curl($url_part, $post_fields = false, $phone_number_id = false, $type = 'POST') {
    $response = sb_curl('https://graph.facebook.com/v13.0/' . $url_part, $post_fields ? $post_fields : '', ['Authorization: Bearer ' . sb_whatsapp_cloud_get_token($phone_number_id)], $type);
    return is_string($response) ? json_decode($response, true) : $response;
}

function sb_whatsapp_cloud_get_token($phone_number_id = false, $return_department = false) {
    if ($phone_number_id) {
        $numbers = sb_get_setting('whatsapp-cloud-numbers');
        if (is_array($numbers)) {
            for ($i = 0; $i < count($numbers); $i++) {
                if ($numbers[$i]['whatsapp-cloud-numbers-phone-id'] == $phone_number_id) {
                    return trim($numbers[$i][$return_department ? 'whatsapp-cloud-numbers-department' : 'whatsapp-cloud-numbers-token']);
                }
            }
        }
    }
    return trim($return_department ? sb_get_setting('whatsapp-department') : sb_get_multi_setting('whatsapp-cloud', 'whatsapp-cloud-token'));
}

function sb_whatsapp_cloud_get_templates($business_account_id = false) {
    $business_account_id = $business_account_id ? $business_account_id : sb_get_multi_setting('whatsapp-cloud', 'whatsapp-cloud-account-id');
    $response = sb_whatsapp_cloud_curl($business_account_id . '/message_templates', false, false, 'GET');
    if (isset($response['data'])) {
        $templates = [];
        $response = $response['data'];
        for ($i = 0; $i < count($response); $i++) {
            $template = $response[$i];
            $is_new = true;
            for ($j = 0; $j < count($templates); $j++) {
                if ($templates[$j]['name'] == $template['name']) {
                    array_push($templates[$j]['languages'], $template['language']);
                    array_push($templates[$j]['ids'], $template['id']);
                    $is_new = false;
                    break;
                }
            }
            if ($is_new) {
                $template['languages'] = [$template['language']];
                $template['ids'] = [$template['id']];
                unset($template['language']);
                unset($template['id']);
                array_push($templates, $template);
            }
        }
        return $templates;
    }
    return $response;
}

function sb_whatsapp_active() {
    return !empty(sb_get_multi_setting('whatsapp-cloud', 'whatsapp-cloud-key')) || !empty(sb_get_multi_setting('whatsapp-twilio', 'whatsapp-twilio-user')) || !empty(sb_get_multi_setting('whatsapp-360', 'whatsapp-360-key'));
}

function sb_whatsapp_twilio_curl($query, $url_part = false, $url = false, $method = 'POST') {
    $settings = sb_get_setting('whatsapp-twilio');
    $header = ['Authorization: Basic ' . base64_encode($settings['whatsapp-twilio-user'] . ':' . $settings['whatsapp-twilio-token'])];
    $url = $url_part ? 'https://api.twilio.com/2010-04-01/Accounts/' . $settings['whatsapp-twilio-user'] . $url_part : $url;
    if ($method == 'POST') {
        $from = $settings['whatsapp-twilio-sender'];
        $query['From'] = trim(strpos($from, 'whatsapp') === false ? ('whatsapp:' . $from) : $from);
    }
    return sb_curl($url, $query, $header, $method);
}

function sb_whatsapp_twilio_get_templates() {
    $response = sb_whatsapp_twilio_curl(false, false, 'https://messaging.twilio.com/v1/Channels/WhatsApp/Templates', 'GET');
    return sb_isset(json_decode($response, true), 'whatsapp_templates', $response);
}

function sb_whatsapp_get_templates($business_account_id = false, $template_name = false, $template_language = false) {
    $provider = sb_whatsapp_provider();
    switch ($provider) {
        case 'official':
            return [$provider, sb_whatsapp_cloud_get_templates($business_account_id)];
        case 'twilio':
            return [$provider, sb_whatsapp_twilio_get_templates()];
        case '360':
            return [$provider, sb_whatsapp_360_templates($template_name, $template_language)];
    }
}

function sb_whatsapp_provider() {
    if (!empty(sb_get_multi_setting('whatsapp-cloud', 'whatsapp-cloud-key'))) {
        return 'official';
    } else if (!empty(sb_get_multi_setting('whatsapp-twilio', 'whatsapp-twilio-user'))) {
        return 'twilio';
    }
    return '360';
}

function sb_whatsapp_send_template_box() { ?>
    <div id="sb-whatsapp-send-template-box" class="sb-lightbox">
        <div class="sb-info"></div>
        <div class="sb-top-bar">
            <div>
                <?php sb_e('Send a WhatsApp message template') ?>
            </div>
            <div>
                <a class="sb-close sb-btn-icon">
                    <i class="sb-icon-close"></i>
                </a>
            </div>
        </div>
        <div class="sb-main sb-scroll-area">
            <div class="sb-title">
                <?php sb_e('User IDs') ?>
            </div>
            <div class="sb-input-setting sb-type-text sb-first">
                <input class="sb-direct-message-users" type="text" placeholder="<?php sb_e('User IDs separated by commas') ?>" required />
            </div>
            <div class="sb-title sb-whatsapp-box-header">
                <?php sb_e('Header') ?>
            </div>
            <div class="sb-input-setting sb-type-text">
                <input id="sb-whatsapp-send-template-header" type="text" placeholder="<?php sb_e('Attributes separated by commas') ?>" />
            </div>
            <div class="sb-title">
                <?php sb_e('Body') ?>
            </div>
            <div class="sb-input-setting sb-type-text">
                <input id="sb-whatsapp-send-template-body" type="text" placeholder="<?php sb_e('Attributes separated by commas') ?>" />
            </div>
            <div class="sb-title">
                <?php sb_e('Template') ?>
            </div>
            <div class="sb-input-setting sb-type-select">
                <select id="sb-whatsapp-send-template-list" required></select>
            </div>
            <div class="sb-bottom">
                <a class="sb-send-direct-message sb-btn sb-icon" data-type="whatsapp">
                    <i class="sb-icon-plane"></i><?php sb_e('Send message now') ?>
                </a>
                <div></div>
                <a class="sb-btn-text" target="_blank" href="https://board.support/docs#direct-messages">
                    <i class="sb-icon-help"></i>
                </a>
            </div>
        </div>
    </div>
<?php } ?>
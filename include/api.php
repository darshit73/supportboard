<?php

/*
 * ==========================================================
 * API.PHP
 * ==========================================================
 *
 * API main file. This file listens the POST queries and return the result. © 2017-2024 board.support. All rights reserved.
 *
 */

require_once('functions.php');

// CRON JOB
if (isset($_GET['piping'])) {
    sb_cloud_load_by_url();
    sb_email_piping(true);
    die();
} else if (isset($_GET['email-notifications'])) {
    sb_cloud_load_by_url();
    sb_cron_email_notifications();
    die();
}

// SMS
if (isset($_POST['AccountSid']) && isset($_POST['From'])) {

    // User and conversation
    $GLOBALS['SB_FORCE_ADMIN'] = true;
    sb_cloud_load_by_url();
    if ($_POST['AccountSid'] != sb_get_multi_setting('sms', 'sms-user')) {
        sb_api_error(sb_error('security-error', 'api.php', 'Wrong AccountSid.'));
    }
    $phone = $_POST['From'];
    $message = $_POST['Body'];
    $user = sb_get_user_by('phone', $phone);
    $conversation_id = false;
    if (!$user) {
        $extra = ['phone' => [$phone, 'Phone']];
        if (!empty($_POST['FromCity'])) {
            $extra['city'] = [ucwords(mb_strtolower($_POST['FromCity'])), 'City'];
        }
        if (!empty($_POST['FromCountry'])) {
            $country_codes = json_decode(file_get_contents(SB_PATH . '/resources/json/countries.json'), true);
            $code = strtoupper($_POST['FromCountry']);
            if (isset($country_codes[$code])) {
                $extra['country'] = [$country_codes[$code], 'Country'];
            }
        }
        if ($message && (sb_get_multi_setting('google', 'google-language-detection') || sb_get_multi_setting('dialogflow-language-detection', 'dialogflow-language-detection-active'))) { // Deprecated: sb_get_multi_setting('dialogflow-language-detection', 'dialogflow-language-detection-active')
            $detected_language = sb_google_language_detection($message);
            if (!empty($detected_language)) {
                $extra['language'] = [$detected_language, 'Language'];
            }
        }
        $user_id = sb_add_user([], $extra);
        $user = sb_get_user($user_id);
    } else {
        $user_id = $user['id'];
        $conversation_id = sb_isset(sb_db_get('SELECT id FROM sb_conversations WHERE user_id = ' . $user_id . ' AND source = "tm" ORDER BY id DESC LIMIT 1'), 'id');
    }
    $GLOBALS['SB_LOGIN'] = $user;

    // Attachments
    $attachments = [];
    for ($i = 0; $i < 10; $i++) {
        $url = sb_isset($_POST, 'MediaUrl' . $i);
        if ($url && isset($_POST['MediaContentType' . $i])) {
            switch ($_POST['MediaContentType0']) {
                case 'video/mp4':
                    $extension = '.mp4';
                    break;
                case 'image/gif':
                    $extension = '.gif';
                    break;
                case 'image/png':
                    $extension = '.png';
                    break;
                case 'image/jpg':
                case 'image/jpeg':
                    $extension = '.jpg';
                    break;
                case 'image/webp':
                    $extension = '.webp';
                    break;
                case 'audio/ogg':
                    $extension = '.ogg';
                    break;
                case 'audio/mpeg':
                    $extension = '.mp3';
                    break;
                case 'audio/amr':
                    $extension = '.amr';
                    break;
                case 'application/pdf':
                    $extension = '.pdf';
                    break;
            }
            if ($extension) {
                $file_name = basename($url) . $extension;
                array_push($attachments, [$file_name, sb_download_file($url, $file_name)]);
            }
        }
    }

    // Send message to Support Board
    if (!$conversation_id) {
        $conversation_id = sb_isset(sb_new_conversation($user_id, 2, '', false, -1, 'tm'), 'details', [])['id'];
    }
    sb_send_message($user_id, $conversation_id, $message, $attachments, 2);

    // Dialogflow and Slack
    if (!$agent) {
        if (defined('SB_DIALOGFLOW') && sb_get_setting('dialogflow-sms')) {
            sb_messaging_platforms_functions($conversation_id, $message, $attachments, $user, ['source' => 'tm', 'phone' => $phone]);
        } else if (defined('SB_SLACK') && sb_get_setting('slack-active') && (!defined('SB_DIALOGFLOW') || (!sb_get_setting('dialogflow-active') && !sb_get_multi_setting('google', 'dialogflow-active') && !sb_get_multi_setting('open-ai', 'open-ai-active')) || sb_dialogflow_is_human_takeover($conversation_id))) { // Deprecated: sb_get_setting('dialogflow-active')
            sb_send_slack_message($user['id'], sb_get_user_name($user), $user['profile_image'], $message, $attachments, $conversation_id);
        }
    }

    $GLOBALS['SB_FORCE_ADMIN'] = false;
    die();
}

// API
$body = json_decode(file_get_contents('php://input'), true);
if ($body) {
    $_POST = array_merge($_POST, $body);
}
if (!isset($_POST['function'])) {
    die(json_encode(['status' => 'error', 'response' => 'missing-function-name', 'message' => 'Function name is required. Get it from the docs.']));
}
define('SB_API', true);
sb_process_api();

function sb_process_api() {
    $function_name = $_POST['function'];
    $functions = [
        'get-user-by' => ['by', 'value'],
        'update-bot' => [],
        'get-last-agent-in-conversation' => ['conversation_id'],
        'get-last-message' => ['conversation_id'],
        'delete-attachments' => [],
        'execute-bot-message' => ['name'],
        'messaging-platforms-send-message' => ['message', 'conversation_id'],
        'translate-string' => ['string', 'language_code'],
        'save-external-setting' => ['name', 'value'],
        'get-multi-setting' => ['id', 'sub_id'],
        'newsletter' => ['email'],
        'upload-path' => [],
        'is-allowed-extension' => ['extension'],
        'system-requirements' => [],
        'logs' => ['string'],
        'aws-s3' => ['file_path'],
        'automations-is-sent' => ['user_id', 'automation'],
        'login' => [],
        'logout' => [],
        'update-login' => [],
        'is-online' => ['user_id'],
        'get-setting' => ['setting'],
        'get-external-setting' => ['setting'],
        'saved-replies' => [],
        'get-settings' => [],
        'save-settings' => ['setting'],
        'add-user' => [],
        'get-user' => ['user_id'],
        'get-user-extra' => ['user_id'],
        'get-user-language' => ['user_id'],
        'get-new-users' => ['datetime'],
        'get-users' => [],
        'get-online-users' => [],
        'get-user-from-conversation' => ['conversation_id'],
        'get-users-with-details' => ['details'],
        'search-users' => ['search'],
        'delete-user' => ['user_id'],
        'delete-users' => ['user_ids'],
        'update-user' => ['user_id'],
        'count-users' => [],
        'update-user-to-lead' => ['user_id'],
        'get-conversations' => [],
        'get-new-conversations' => ['datetime'],
        'get-conversation' => ['conversation_id'],
        'search-conversations' => ['search'],
        'search-user-conversations' => ['search', 'user_id'],
        'new-conversation' => ['user_id'],
        'get-user-conversations' => ['user_id'],
        'get-new-user-conversations' => ['user_id', 'datetime'],
        'update-conversation-status' => ['conversation_id', 'status_code'],
        'update-conversation-department' => ['conversation_id', 'department'],
        'set-rating' => ['settings'],
        'get-rating' => ['user_id'],
        'get-new-messages' => ['user_id', 'conversation_id', 'datetime'],
        'send-message' => ['user_id', 'conversation_id'],
        'send-bot-message' => ['conversation_id', 'message'],
        // Deprecated
        'send-slack-message' => ['user_id'],
        'update-message' => ['message_id'],
        'update-messages-status' => ['conversation_id', 'message_ids'],
        'delete-message' => ['message_id'],
        'send-email' => ['recipient_id', 'message'],
        'send-custom-email' => ['to', 'subject', 'message'],
        'slack-users' => [],
        'archive-slack-channels' => [],
        'slack-channels' => [],
        'slack-presence' => [],
        'current-url' => [],
        'get-articles' => [],
        'get-articles-categories' => [],
        'save-articles-categories' => ['categories'],
        'save-article' => ['article'],
        'search-articles' => ['search'],
        'article-ratings' => [],
        'get-versions' => [],
        'update' => [],
        'wp-sync' => [],
        'app-get-key' => ['app_name'],
        'app-activation' => ['app_name', 'key'],
        'csv-users' => [],
        'transcript' => ['conversation_id'],
        'cron-jobs' => [],
        'is-typing' => ['user_id', 'conversation_id'],
        'is-agent-typing' => ['conversation_id'],
        'set-typing' => [],
        'push-notification' => ['title', 'message', 'interests'],
        'dialogflow-message' => [],
        'dialogflow-create-intent' => ['expressions', 'response'],
        'dialogflow-entity' => ['entity_name', 'synonyms'],
        'dialogflow-get-entity' => [],
        'dialogflow-get-token' => [],
        'dialogflow-get-agent' => ['context_name', 'user_id'],
        'dialogflow-set-active-context' => ['context_name'],
        'dialogflow-curl' => ['url_part', 'query'],
        'dialogflow-get-intents' => [],
        'dialogflow-update-intent' => ['intent_name', 'expressions', 'response'],
        'woocommerce-get-customer' => ['session_key'],
        'woocommerce-get-user-orders' => ['user_id'],
        'woocommerce-get-order' => ['order_id'],
        'woocommerce-get-product' => ['product_id'],
        'woocommerce-get-taxonomies' => ['type'],
        'woocommerce-get-attributes' => [],
        'woocommerce-get-product-id-by-name' => ['name'],
        'woocommerce-get-product-images' => ['product_id'],
        'woocommerce-get-product-taxonomies' => ['product_id'],
        'woocommerce-get-attribute-by-term' => ['term_name'],
        'woocommerce-get-attribute-by-name' => ['name'],
        'woocommerce-is-in-stock' => ['product_id'],
        'woocommerce-coupon' => ['discount', 'expiration'],
        'woocommerce-coupon-check' => ['user_id'],
        'woocommerce-coupon-delete-expired' => [],
        'woocommerce-get-url' => ['type'],
        'woocommerce-get-session' => ['session_key'],
        'woocommerce-get-session-key' => ['user_id'],
        'woocommerce-payment-methods' => [],
        'woocommerce-shipping-locations' => [],
        'woocommerce-get-products' => [],
        'woocommerce-search-products' => ['search'],
        'woocommerce-dialogflow-entities' => [],
        'woocommerce-dialogflow-intents' => [],
        'pusher-trigger' => ['channel', 'event'],
        'chat-css' => [],
        'get-avatar' => ['first_name'],
        'get-agents-ids' => [],
        'text-formatting-to-html' => ['message'],
        'clear-text-formatting' => ['message'],
        'send-sms' => ['message', 'to'],
        'get-notes' => ['conversation_id'],
        'add-note' => ['conversation_id', 'user_id', 'name', 'message'],
        'delete-note' => ['conversation_id', 'note_id'],
        'automations-get' => [],
        'automations-save' => ['automations'],
        'automations-run' => ['automation'],
        'automations-run-all' => [],
        'automations-validate' => ['automation'],
        'email-piping' => [],
        'get-bot-id' => [],
        'get-agents-in-conversation' => ['conversation_id'],
        'update-conversation-agent' => ['conversation_id', 'agent_id'],
        'open-ai-curl' => ['url_part'],
        'open-ai-message' => ['message'],
        'open-ai-user-expressions' => ['message'],
        'clean-data' => [],
        'get-translation' => ['language_code'],
        'get-translations' => [],
        'save-translations' => ['translations'],
        'direct-message' => ['user_ids'],
        'reports' => ['name'],
        'reports-update' => ['name'],
        'get-departments' => [],
        'delete-leads' => [],
        'updates-available' => [],
        'google-translate' => ['strings', 'language_code'],
        'google-translate-detection-update-user' => ['string', 'user_id'],
        'export-settings' => [],
        'import-settings' => ['file_url'],
        'count-conversations' => [],
        'check-conversations-assignment' => ['conversation_ids'],
        'gbm-send-message' => ['google_conversation_id'],
        'messenger-send-message' => ['psid', 'facebook_page_id'],
        'whatsapp-send-message' => ['to'],
        'telegram-send-message' => ['chat_id'],
        'viber-send-message' => ['viber_id'],
        'line-send-message' => ['line_id'],
        'wechat-send-message' => ['open_id'],
        'init-articles' => []
    ];

    if (!isset($functions[$function_name])) {
        sb_api_error(sb_error('function-not-found', $function_name, 'Function ' . $function_name . ' not found. Check the function name.'));
    }

    if (!isset($_POST['token'])) {
        sb_api_error(sb_error('token-not-found', $function_name, 'Admin token is required. Get it from ' . (sb_is_cloud() ? CLOUD_URL . '/account.' : 'Users > Your admin user profile box.')));
    } else if (sb_is_cloud()) {
        require_once(SB_CLOUD_PATH . '/account/functions.php');
        cloud_api();
    } else if (!sb_api_security($_POST['token'])) {
        sb_api_error(sb_error('invalid-token', $function_name, 'Use a token of an administrator.'));
    }

    if (count($functions[$function_name]) > 0) {
        for ($i = 0; $i < count($functions[$function_name]); $i++) {
            if (!isset($_POST[$functions[$function_name][$i]])) {
                sb_api_error(sb_error('missing-argument', $function_name, 'Missing argument: ' . $functions[$function_name][$i]));
            }
        }
    }

    // Check if the app required by a method is installed
    $apps = [
        'SB_WP' => ['wp-sync'],
        'SB_DIALOGFLOW' => ['dialogflow-message', 'dialogflow-create-intent', 'dialogflow-intent', 'dialogflow-entity', 'dialogflow-get-entity', 'dialogflow-get-token', 'dialogflow-get-agent', 'dialogflow-set-active-context', 'dialogflow-curl', 'send-bot-message'],
        'SB_SLACK' => ['send-slack-message', 'slack-users', 'archive-slack-channels']
    ];

    foreach ($apps as $key => $value) {
        if ((in_array($function_name, $value) && !defined($key))) {
            sb_api_error(sb_error('app-not-installed', $function_name));
        }
    }

    // Convert JSON to array
    $json_keys = [];
    switch ($function_name) {
        case 'automations-is-sent':
            $json_keys = ['automation'];
            break;
        case 'dialogflow-update-intent':
            $json_keys = ['expressions'];
            break;
        case 'google-translate':
            $json_keys = ['strings'];
            break;
        case 'save-settings':
            $json_keys = ['settings'];
            break;
        case 'get-users':
            $json_keys = ['user_types'];
            break;
        case 'save-articles-categories':
            $json_keys = ['categories'];
            break;
        case 'get-online-users':
            $json_keys = ['exclude_id'];
            break;
        case 'update-user':
            $json_keys = ['settings_extra'];
            break;
        case 'add-user':
            $json_keys = ['extra'];
            break;
        case 'csv-users':
        case 'delete-users':
        case 'direct-message':
            $json_keys = ['user_ids'];
            break;
        case 'set-rating':
            $json_keys = ['settings'];
            break;
        case 'save-translations':
            $json_keys = ['translations'];
            break;
        case 'update-message':
        case 'send-message':
            $json_keys = ['attachments', 'payload'];
            break;
        case 'update-messages-status':
            $json_keys = ['message_ids'];
            break;
        case 'gbm-send-message':
        case 'messenger-send-message':
        case 'whatsapp-send-message':
        case 'telegram-send-message':
        case 'viber-send-message':
        case 'line-send-message':
        case 'wechat-send-message':
        case 'messaging-platforms-send-message':
        case 'send-email':
        case 'send-slack-message':
        case 'dialogflow-message':
            $json_keys = ['attachments'];
            break;
        case 'dialogflow-create-intent':
            $json_keys = ['expressions'];
            break;
        case 'dialogflow-entity':
            $json_keys = ['synonyms'];
            break;
        case 'dialogflow-set-active-context':
            $json_keys = ['parameters'];
            break;
        case 'woocommerce-get-products':
            $json_keys = ['filters'];
            break;
        case 'save-article':
            $json_keys = ['article'];
            break;
        case 'pusher-trigger':
            $json_keys = ['data'];
            break;
        case 'open-ai-curl':
            $json_keys = ['post_fields'];
            break;
    }
    for ($i = 0; $i < count($json_keys); $i++) {
        $value = sb_isset($_POST, $json_keys[$i]);
        if ($value && is_string($value)) {
            $_POST[$json_keys[$i]] = json_decode($value, true);
        }
    }

    // Additional WEB API
    switch ($function_name) {
        case 'get-external-setting':
            die(sb_api_success(sb_get_external_setting($_POST['setting'])));
        case 'get-setting':
            die(sb_api_success(sb_get_setting($_POST['setting'])));
        case 'update-user':
        case 'add-user':
            $values = ['first_name', 'last_name', 'email', 'profile_image', 'password', 'user_type', 'department'];
            $settings = [];
            $extra = sb_isset($_POST, $function_name == 'update-user' ? 'settings_extra' : 'extra', []);
            for ($i = 0; $i < count($values); $i++) {
                if (isset($_POST[$values[$i]])) {
                    $settings[$values[$i]] = [$_POST[$values[$i]]];
                }
            }
            die(sb_api_success($function_name == 'add-user' ? sb_add_user($settings, $extra) : sb_update_user($_POST['user_id'], $settings, $extra)));
        case 'text-formatting-to-html':
            die(sb_api_success(sb_text_formatting_to_html($_POST['message'])));
        case 'clear-text-formatting':
            die(sb_api_success(sb_clear_text_formatting($_POST['message'])));
        case 'get-bot-id':
            die(sb_api_success(sb_get_bot_id()));
        case 'open-ai-curl':
            die(sb_api_success(sb_open_ai_curl($_POST['url_part'], sb_isset($_POST, 'post_fields'), sb_isset($_POST, 'type'))));
        case 'init-articles':
            ob_start();
            require('articles.php');
            $content = (empty($_POST['nojquery']) ? '<script src="' . SB_URL . '/js/min/jquery.min.js"></script>' : '') . (empty($_POST['nojs']) ? '<script src="' . SB_URL . '/js/min/main.min.js"></script>' : '') . '<link href="' . SB_URL . '/css/main.css" type="text/css" rel="stylesheet"><link href="' . SB_URL . '/css/articles.css" type="text/css" rel="stylesheet">';
            $content .= ob_get_clean();
            die($content);
        default:
            require_once('ajax.php');
            break;
    }
}

/*
 * -----------------------------------------------------------
 * # FUNCTIONS
 * -----------------------------------------------------------
 *
 * Help functions used only by the APIs
 *
 */

function sb_api_error($error, $die = true) {
    $response = ['status' => 'error', 'response' => $error->code()];
    if ($error->message()) {
        $response['message'] = $error->message();
    }
    $response = json_encode($response);
    if ($die) {
        die($response);
    }
    return $response;
}

function sb_api_success($result) {
    $response = [];
    if (sb_is_validation_error($result)) {
        $response['success'] = false;
        $response['response'] = $result->code();
    } else {
        $response['success'] = true;
        $response['response'] = $result;
    }
    die(json_encode($response));
}

function sb_api_security($token) {
    $admin = sb_db_get('SELECT * FROM sb_users WHERE token = "' . sb_db_escape($_POST['token']) . '" LIMIT 1');
    if (isset($admin['user_type']) && $admin['user_type'] === 'admin') {
        global $SB_LOGIN;
        $SB_LOGIN = ['id' => $admin['id'], 'profile_image' => $admin['profile_image'], 'first_name' => $admin['first_name'], 'last_name' => $admin['last_name'], 'email' => $admin['email'], 'user_type' => 'admin', 'token' => $_POST['token']];
        return true;
    }
    return false;
}

?>
<?php
use UI\Draw\Color;

/*
 * ==========================================================
 * FUNCTIONS_SETTINGS.PHP
 * ==========================================================
 *
 * Settings functions file. © 2017-2023 board.support. All rights reserved.
 *
 * -----------------------------------------------------------
 * SETTINGS
 * -----------------------------------------------------------
 * 1. Return the JS settings of the front-end
 * 2. Return the JS settings of admin area
 * 3. Return the JS settings shared by both the admin and the front-end
 * 4. Return the JS settings of block message
 * 5. Populate the admin area with the settings of the file /resources/json/settings.json
 * 6. Pupulate the admin area of the apps
 * 7. Return the HTML code of a setting element
 * 8. Save the all settings and external settings
 * 9. Save an external setting
 * 10. Return the settings array
 * 11. Return all settings and external settings
 * 12. Return the setting with the given name
 * 13. Return a single setting of a multi values setting
 * 14. Return the external setting with the given name
 * 15. Return a multilingual external setting
 * 16. Return the HTML code of the color palette
 * 17. Export all settings and external settings
 * 18. Import all settings and external settings
 * 19. Return the departments array
 * 20. Echo the departments list
 * 21. Check if the current time is within the office hours
 * 22. Generate the CSS with values setted in the settings area
 * 23. Check the system for requirements and issues
 * 24. Countries list
 * 25. Langauges list
 * 26. Phone codes list
 * 27. Get config file settings
 *
 */

function sb_get_front_settings() {
    global $SB_LANGUAGE;
    sb_updates_validation();
    $active_user = sb_get_active_user();
    $is_office_hours = sb_office_hours();
    $return = [
        'translations' => sb_get_current_translations(),
        'registration_required' => sb_get_setting('registration-required'),
        'registration_timetable' => sb_get_setting('registration-timetable'),
        'registration_offline' => sb_get_setting('registration-offline'),
        'registration_link' => sb_get_setting('registration-link', ''),
        'registration_details' => sb_get_setting('registration-user-details-success'),
        'visitors_registration' => sb_get_setting('visitors-registration'),
        'privacy' => sb_get_multi_setting('privacy', 'privacy-active'),
        'popup' => empty($_POST['popup']) ? false : sb_get_block_setting('popup'),
        'follow' => sb_get_multi_setting('follow-message', 'follow-active') && ($is_office_hours || !sb_get_multi_setting('follow-message', 'follow-disable-office-hours')) ? sb_get_multi_setting('follow-message', 'follow-delay', true) : false,
        'popup_mobile_hidden' => sb_get_multi_setting('popup-message', 'popup-mobile-hidden'),
        'welcome' => sb_get_multi_setting('welcome-message', 'welcome-active'),
        'subscribe' => sb_get_multi_setting('subscribe-message', 'subscribe-active'),
        'subscribe_delay' => sb_get_multi_setting('subscribe-message', 'subscribe-delay', 2000),
        'chat_manual_init' => sb_get_setting('chat-manual-init'),
        'chat_login_init' => sb_get_setting('chat-login-init'),
        'sound' => ['code' => sb_get_setting('chat-sound', 'n'), 'volume' => sb_get_multi_setting('sound-settings', 'sound-settings-volume', 0.6), 'repeat' => sb_get_multi_setting('sound-settings', 'sound-settings-repeat')],
        'header_name' => sb_get_setting('header-name', ''),
        'desktop_notifications' => sb_get_setting('desktop-notifications') && !sb_get_multi_setting('push-notifications', 'push-notifications-active'),
        'flash_notifications' => sb_get_setting('flash-notifications'),
        'push_notifications' => sb_get_multi_setting('push-notifications', 'push-notifications-active'),
        'notifications_icon' => sb_is_cloud() ? SB_CLOUD_BRAND_ICON_PNG : sb_get_setting('notifications-icon', SB_URL . '/media/icon.png'),
        'notify_email_cron' => sb_get_setting('notify-email-cron'),
        'bot_id' => sb_get_bot_id(),
        'bot_name' => sb_get_setting('bot-name', ''),
        'bot_image' => sb_get_setting('bot-image', ''),
        'bot_delay' => sb_get_setting('dialogflow-bot-delay', 2000),
        'dialogflow_active' => sb_chatbot_active(true, false),
        'open_ai_active' => sb_chatbot_active(false, true),
        'slack_active' => defined('SB_SLACK') && sb_get_setting('slack-active'),
        'rich_messages' => sb_get_rich_messages_ids(),
        'display_users_thumb' => sb_get_setting('display-users-thumb'),
        'hide_agents_thumb' => sb_get_setting('hide-agents-thumb'),
        'auto_open' => sb_get_setting('auto-open'),
        'office_hours' => $is_office_hours,
        'disable_office_hours' => sb_get_setting('chat-timetable-disable'),
        'disable_offline' => sb_get_setting('chat-offline-disable'),
        'timetable' => sb_get_multi_setting('chat-timetable', 'chat-timetable-active'),
        'articles' => sb_get_setting('articles-active'),
        'articles_title' => sb_get_setting('articles-title', ''),
        'init_dashboard' => sb_get_setting('init-dashboard') && !sb_get_setting('disable-dashboard'),
        'disable_dashboard' => sb_get_setting('disable-dashboard'),
        'queue' => sb_get_multi_setting('queue', 'queue-active'),
        'hide_conversations_routing' => !sb_get_multi_setting('queue', 'queue-active') && sb_get_multi_setting('agent-hide-conversations', 'agent-hide-conversations-active') && sb_get_multi_setting('agent-hide-conversations', 'agent-hide-conversations-routing'),
        'webhooks' => sb_get_multi_setting('webhooks', 'webhooks-active') ? sb_get_multi_setting('webhooks', 'webhooks-allowed', true) : false,
        'agents_online' => sb_agents_online(),
        'cron' => date('H') != sb_get_external_setting('cron'),
        'cron_email_piping' => sb_get_multi_setting('email-piping', 'email-piping-active') && !sb_get_multi_setting('email-piping', 'email-piping-disable-cron') && date('i') != sb_get_external_setting('cron-email-piping'),
        'cron_email_piping_active' => sb_get_multi_setting('email-piping', 'email-piping-active') && !sb_get_multi_setting('email-piping', 'email-piping-disable-cron'),
        'wp' => defined('SB_WP'),
        'perfex' => defined('SB_PERFEX'),
        'whmcs' => defined('SB_WHMCS'),
        'aecommerce' => defined('SB_AECOMMERCE'),
        'martfury' => defined('SB_MARTFURY') && sb_get_setting('martfury-private') ? sb_get_setting('martfury-linking') : [],
        'messenger' => defined('SB_MESSENGER'),
        'pusher' => sb_pusher_active(),
        'cookie_domain' => sb_get_setting('cookie-domain'),
        'visitor_default_name' => sb_get_setting('visitor-default-name', 'User'),
        'sms_active_agents' => sb_get_multi_setting('sms', 'sms-active-agents'),
        'language_detection' => false,
        'cloud' => sb_is_cloud() ? ['cloud_user_id' => json_decode(sb_encryption($_POST['cloud'], false), true)['user_id']] : false,
        'automations' => sb_automations_run_all(),
        'phone_codes' => sb_get_multi_setting('performance', 'performance-phone-codes') ? [] : (sb_get_setting('phone-code') ? [sb_get_setting('phone-code')] : array_values(json_decode(file_get_contents(SB_PATH . '/resources/json/phone.json'), true))),
        'rtl' => sb_get_setting('rtl'),
        'close_chat' => sb_get_setting('close-chat'),
        'sender_name' => sb_get_setting('sender-name'),
        'tickets' => defined('SB_TICKETS') && !empty($_POST['tickets']) && $_POST['tickets'] != 'false',
        'max_file_size' => sb_get_server_max_file_size()
    ];
    if ($return['welcome']) {
        $return['welcome_trigger'] = sb_get_multi_setting('welcome-message', 'welcome-trigger', 'load');
        $return['welcome_delay'] = sb_get_multi_setting('welcome-message', 'welcome-delay', 2000);
        $return['welcome_disable_office_hours'] = sb_get_multi_setting('welcome-message', 'welcome-disable-office-hours');
    }
    if ($return['queue']) {
        $return['queue_message'] = sb_get_multi_setting('queue', 'queue-message', '');
        $return['queue_response_time'] = sb_get_multi_setting('queue', 'queue-response-time', 5);
        $return['queue_sound'] = sb_get_multi_setting('queue', 'queue-sound');
    }
    if ($return['timetable']) {
        $return['timetable_type'] = sb_get_multi_setting('chat-timetable', 'chat-timetable-type');
        $return['timetable_hide'] = sb_get_multi_setting('chat-timetable', 'chat-timetable-hide');
        $return['timetable_disable_agents'] = sb_get_multi_setting('chat-timetable', 'chat-timetable-agents');
    }
    if ($return['wp']) {
        $return['wp_users_system'] = sb_get_setting('wp-users-system', 'sb');
        $return['wp_registration'] = sb_get_setting('wp-registration');
    }
    if ($return['push_notifications']) {
        $return['push_notifications_id'] = sb_get_multi_setting('push-notifications', 'push-notifications-id');
        $return['push_notifications_url'] = sb_get_multi_setting('push-notifications', 'push-notifications-sw-url');
        $return['push_notifications_users'] = sb_get_multi_setting('push-notifications', 'push-notifications-users-active');
    }
    if ($return['pusher']) {
        $return['pusher_key'] = $return['cloud'] ? CLOUD_PUSHER_KEY : sb_get_multi_setting('pusher', 'pusher-key');
        $return['pusher_cluster'] = $return['cloud'] ? CLOUD_PUSHER_CLUSTER : sb_get_multi_setting('pusher', 'pusher-cluster');
    }
    if (!empty($return['timetable_hide']) || !empty($return['timetable_type'])) {
        $return['timetable_message'] = [sb_t(sb_get_multi_setting('chat-timetable', 'chat-timetable-title')), sb_t(sb_get_multi_setting('chat-timetable', 'chat-timetable-msg'))];
    }
    if ($return['tickets']) {
        $return['tickets_registration_required'] = sb_get_setting('tickets-registration-required');
        $return['tickets_registration_redirect'] = sb_get_setting('tickets-registration-redirect', '');
        $return['tickets_default_form'] = sb_get_setting('tickets-registration-disable-password') ? 'registration' : sb_get_setting('tickets-default-form', 'login');
        $return['tickets_conversations_title_user'] = sb_get_setting('tickets-conversations-title-user');
        $return['tickets_welcome_active'] = sb_get_multi_setting('tickets-welcome-message', 'tickets-welcome-message-active');
        $return['tickets_welcome_message'] = sb_merge_fields(sb_t(sb_get_multi_setting('tickets-welcome-message', 'tickets-welcome-message-msg')));
        $return['tickets_conversation_name'] = sb_get_setting('tickets-conversation-name', '');
        $return['tickets_enter_button'] = sb_get_setting('tickets-enter-button');
        $return['tickets_manual_init'] = sb_get_setting('tickets-manual-init');
        $return['tickets_default_department'] = sb_get_setting('tickets-default-department');
        $return['tickets_names'] = sb_get_setting('tickets-names');
        $return['tickets_hide'] = sb_get_setting('tickets-hide');
        $return['tickets_recaptcha'] = sb_get_multi_setting('tickets-recaptcha', 'tickets-recaptcha-active') ? sb_get_multi_setting('tickets-recaptcha', 'tickets-recaptcha-key') : false;
        $return['tickets_disable_first'] = sb_get_multi_setting('tickets-disable-features', 'tickets-first-ticket');
    }
    if (defined('SB_WOOCOMMERCE')) {
        $return['woocommerce'] = true;
        $return['woocommerce_returning_'] = !in_array(sb_isset($active_user, 'user_type'), ['user', 'agent', 'admin']) && sb_get_multi_setting('wc-returning-visitor', 'wc-returning-visitor-active');
    }
    if ($return['dialogflow_active'] || $return['open_ai_active']) {
        $return['dialogflow_human_takeover'] = sb_get_multi_setting('dialogflow-human-takeover', 'dialogflow-human-takeover-active');
        $return['dialogflow_human_takeover_disable_chatbot'] = sb_get_multi_setting('dialogflow-human-takeover', 'dialogflow-human-takeover-disable-chatbot');
        $return['dialogflow_welcome'] = sb_get_setting('dialogflow-welcome') || sb_get_multi_setting('google', 'google-welcome'); // Deprecated: sb_get_setting('dialogflow-welcome')
        $return['dialogflow_send_user_details'] = sb_get_setting('dialogflow-send-user-details') || sb_get_multi_setting('google', 'dialogflow-send-user-details'); // Deprecated: sb_get_setting('dialogflow-send-user-details')
        $return['dialogflow_departments'] = sb_get_setting('dialogflow-departments');
        $return['dialogflow_disable_tickets'] = sb_get_setting('dialogflow-disable-tickets');
        $return['dialogflow_office_hours'] = sb_get_setting('dialogflow-timetable');
        if ($return['queue'] && $return['dialogflow_human_takeover']) {
            $return['queue'] = false;
            $return['queue_human_takeover'] = true;
        }
        if (sb_get_multi_setting('chatbot-usage-limit', 'chatbot-usage-limit-quota')) {
            $return['chatbot_limit'] = ['quota' => intval(sb_get_multi_setting('chatbot-usage-limit', 'chatbot-usage-limit-quota')), 'interval' => intval(sb_get_multi_setting('chatbot-usage-limit', 'chatbot-usage-limit-interval')), 'message' => sb_get_multi_setting('chatbot-usage-limit', 'chatbot-usage-limit-message')];
        }
    } else if (defined('SB_DIALOGFLOW') && (sb_get_multi_setting('google', 'google-language-detection') || sb_get_multi_setting('dialogflow-language-detection', 'dialogflow-language-detection-active'))) { // Deprecated: sb_get_multi_setting('dialogflow-language-detection', 'dialogflow-language-detection-active')
        $return['language_detection'] = true;
    }
    if ($active_user) {
        $user_id = $active_user['id'];
        $current_url = false;
        if (!sb_is_agent($active_user)) {
            try {
                $current_url = isset($_POST['current_url']) ? $_POST['current_url'] : $_SERVER['HTTP_REFERER'];
                if ($current_url)
                    sb_current_url($user_id, $current_url);
            } catch (Exception $e) {
            }
            if ($return['pusher']) {
                sb_pusher_trigger('private-user-' . $user_id, 'init', ['current_url' => $current_url]);
            }
        }
        sb_update_users_last_activity($user_id);
    }
    return $return;
}

function sb_js_admin() {
    $cloud = sb_is_cloud();
    $active_user = sb_get_active_user();
    $active_user_type = $active_user ? $active_user['user_type'] : false;
    $agent = $active_user_type == 'agent';
    $language = sb_get_admin_language();
    $settings = [
        'bot_id' => sb_get_bot_id(),
        'close_message' => sb_get_multi_setting('close-message', 'close-active'),
        'close_message_transcript' => sb_get_multi_setting('close-message', 'close-transcript'),
        'routing' => (!$active_user || $agent) && (sb_get_multi_setting('queue', 'queue-active') || sb_get_setting('routing') || sb_get_multi_setting('agent-hide-conversations', 'agent-hide-conversations-active')),
        'desktop_notifications' => sb_get_setting('desktop-notifications'),
        'push_notifications' => sb_get_multi_setting('push-notifications', 'push-notifications-active'),
        'push_notifications_users' => sb_get_multi_setting('push-notifications', 'push-notifications-users-active'),
        'push_notifications_id' => sb_get_multi_setting('push-notifications', 'push-notifications-id'),
        'flash_notifications' => sb_get_setting('flash-notifications'),
        'notifications_icon' => $cloud ? SB_CLOUD_BRAND_ICON_PNG : sb_get_setting('notifications-icon', SB_URL . '/media/icon.png'),
        'auto_updates' => sb_get_setting('auto-updates'),
        'sound' => ['code' => sb_get_setting('chat-sound-admin'), 'volume' => sb_get_multi_setting('sound-settings', 'sound-settings-volume-admin', 0.6), 'repeat' => sb_get_multi_setting('sound-settings', 'sound-settings-repeat-admin')],
        'pusher' => sb_pusher_active(),
        'notify_user_email' => sb_get_setting('notify-user-email') || sb_get_multi_setting('email-piping', 'email-piping-active'),
        'assign_conversation_to_agent' => $agent && sb_get_multi_setting('agent-hide-conversations', 'agent-hide-conversations-active') && sb_get_multi_setting('agent-hide-conversations', 'agent-hide-conversations-view'),
        'allow_agent_delete_message' => $active_user_type == 'admin' || sb_get_multi_setting('agents', 'agents-delete-message'),
        'supervisor' => sb_supervisor() ? true : false,
        'sms_active_users' => sb_get_multi_setting('sms', 'sms-active-users'),
        'sms' => sb_get_multi_setting('sms', 'sms-user'),
        'now_db' => gmdate('Y-m-d H:i:s'),
        'login_time' => time(),
        'single_agent' => intval(sb_db_get('SELECT COUNT(*) as count FROM sb_users WHERE user_type = "agent" OR user_type = "admin"')['count']) == 1,
        'slack_active' => sb_get_setting('slack-active'),
        'zendesk_active' => sb_get_setting('zendesk-active'),
        'active_agent_language' => sb_get_user_language(sb_get_active_user_ID()),
        'transcript_message' => sb_get_multi_setting('transcript', 'transcript-message', ''),
        'cookie_domain' => sb_get_setting('cookie-domain'),
        'cloud' => $cloud,
        'online_users_notification' => sb_get_setting('online-users-notification') ? sb_('New user online') : false,
        'webhooks' => sb_get_multi_setting('webhooks', 'webhooks-active') ? sb_get_multi_setting('webhooks', 'webhooks-allowed', true) : false,
        'show_profile_images' => sb_get_setting('show-profile-images-admin'),
        'sender_name' => sb_get_setting('sender-name'),
        'notify_email_cron' => sb_get_setting('notify-email-cron'),
        'order_by_date' => sb_get_setting('order-by-date'),
        'max_file_size' => sb_get_server_max_file_size(),
        'reports_disabled' => sb_get_multi_setting('performance', 'performance-reports'),
        'rich_messages' => sb_get_rich_messages_ids(),
        'color' => sb_get_setting('color-admin-1')
    ];
    $code = '<script>';
    if (defined('SB_DIALOGFLOW')) {
        $settings['dialogflow'] = sb_get_multi_setting('google', 'dialogflow-active');
        $settings['open_ai_user_expressions'] = sb_get_multi_setting('open-ai', 'open-ai-user-expressions');
        $settings['open_ai_prompt_rewrite'] = sb_get_multi_setting('open-ai', 'open-ai-prompt-message-rewrite');
        $settings['smart_reply'] = sb_get_multi_setting('dialogflow-smart-reply', 'dialogflow-smart-reply-active') || sb_get_setting('ai-smart-reply'); // Deprecated: sb_get_multi_setting('dialogflow-smart-reply', 'dialogflow-smart-reply-active')
        $settings['open_ai_model'] = function_exists('sb_open_ai_get_gpt_model') ? sb_open_ai_get_gpt_model() : 'gpt-3.5-turbo'; // Deprecated: function_exists('sb_open_ai_get_gpt_model') ? sb_open_ai_get_gpt_model() : 'gpt-3.5-turbo';
        $settings['translation'] = sb_get_setting('google-translation') || sb_get_multi_setting('google', 'google-translation'); // Deprecated: sb_get_setting('google-translation')
        $settings['multilingual_translation'] = sb_get_multi_setting('google', 'google-multilingual-translation');
        $settings['open_ai_stop_crawler'] = sb_get_multi_setting('open-ai-sources-options', 'open-ai-sources-options-stop-crawler');
    }
    if (defined('SB_WOOCOMMERCE')) {
        $settings['currency'] = sb_get_setting('wc-currency-symbol');
        $settings['languages'] = json_encode(sb_isset(sb_wp_language_settings(), 'languages', []));
    }
    if (defined('SB_PERFEX')) {
        $settings['perfex_url'] = sb_get_setting('perfex-url');
    }
    if (defined('SB_WHMCS')) {
        $settings['whmcs_url'] = sb_get_setting('whmcs-url');
    }
    if (defined('SB_AECOMMERCE')) {
        $settings['aecommerce_panel_title'] = sb_get_setting('aecommerce-panel-title', 'Active eCommerce');
    }
    if ($settings['pusher']) {
        $settings['pusher_key'] = $settings['cloud'] ? CLOUD_PUSHER_KEY : sb_get_multi_setting('pusher', 'pusher-key');
        $settings['pusher_cluster'] = $settings['cloud'] ? CLOUD_PUSHER_CLUSTER : sb_get_multi_setting('pusher', 'pusher-cluster');
    }
    if ($settings['supervisor']) {
        $settings['allow_supervisor_delete_message'] = sb_get_multi_setting('supervisor', 'supervisor-delete-message');
    }
    if ($active_user) {
        if (empty($active_user['url']) || $active_user['url'] == SB_URL) {
            $code .= 'var SB_ACTIVE_AGENT = { id: "' . $active_user['id'] . '", email: "' . $active_user['email'] . '", full_name: "' . sb_get_user_name($active_user) . '", user_type: "' . $active_user_type . '", profile_image: "' . $active_user['profile_image'] . '", department: "' . sb_isset($active_user, 'department', '') . '"};';
        } else {
            $code .= 'SBF.reset();';
        }
    } else {
        $code .= 'var SB_ACTIVE_AGENT = { id: "", full_name: "", user_type: "", profile_image: "", email: "" };';
    }
    if (defined('SB_WP')) {
        $code .= 'var SB_WP = true;';
    }
    if ($cloud) {
        $cookie_cloud = json_decode(sb_encryption($_POST['cloud'], false), true);
        $settings['cloud'] = $cookie_cloud && isset($cookie_cloud['email']) ? ['email' => $cookie_cloud['email'], 'id' => sb_isset(sb_db_get('SELECT id FROM sb_users WHERE email = "' . $cookie_cloud['email'] . '"'), 'id'), 'cloud_user_id' => $cookie_cloud['user_id'], 'token' => $cookie_cloud['token']] : [];
    }
    $file_path = SB_PATH . '/resources/languages/admin/js/' . $language . '.json';
    $translations = $language && $language != 'en' && file_exists($file_path) ? file_get_contents($file_path) : '[]';
    $code .= 'var SB_LANGUAGE_CODES = ' . file_get_contents(SB_PATH . '/resources/languages/language-codes.json') . ';';
    $code .= 'var SB_ADMIN_SETTINGS = ' . json_encode($settings) . ';';
    $code .= 'var SB_TRANSLATIONS = ' . ($translations ? $translations : '[]') . ';';
    $code .= 'var SB_VERSIONS = { sb: "' . SB_VERSION . '", dialogflow: "' . (defined('SB_DIALOGFLOW') ? SB_DIALOGFLOW : -1) . '", slack: "' . (defined('SB_SLACK') ? SB_SLACK : -1) . '", tickets: "' . (defined('SB_TICKETS') ? SB_TICKETS : -1) . '", perfex: "' . (defined('SB_PERFEX') ? SB_PERFEX : -1) . '", whmcs: "' . (defined('SB_WHMCS') ? SB_WHMCS : -1) . '", woocommerce: "' . (defined('SB_WOOCOMMERCE') ? SB_WOOCOMMERCE : -1) . '", ump: "' . (defined('SB_UMP') ? SB_UMP : -1) . '", aecommerce: "' . (defined('SB_AECOMMERCE') ? SB_AECOMMERCE : -1) . '", messenger: "' . (defined('SB_MESSENGER') ? SB_MESSENGER : -1) . '", whatsapp: "' . (defined('SB_WHATSAPP') ? SB_WHATSAPP : -1) . '", armember: "' . (defined('SB_ARMEMBER') ? SB_ARMEMBER : -1) . '", telegram: "' . (defined('SB_TELEGRAM') ? SB_TELEGRAM : -1) . '", viber: "' . (defined('SB_VIBER') ? SB_VIBER : -1) . '", line: "' . (defined('SB_LINE') ? SB_LINE : -1) . '", wechat: "' . (defined('SB_WECHAT') ? SB_WECHAT : -1) . '", twitter: "' . (defined('SB_TWITTER') ? SB_TWITTER : -1) . '", zendesk: "' . (defined('SB_ZENDESK') ? SB_ZENDESK : -1) . '", gbm: "' . (defined('SB_GBM') ? SB_GBM : -1) . '", martfury: "' . (defined('SB_MARTFURY') ? SB_MARTFURY : -1) . '"};';
    $code .= '</script>';
    echo $code;
}

function sb_js_global() {
    global $SB_LANGUAGE;
    if (!isset($SB_LANGUAGE)) {
        sb_init_translations();
    }
    $ajax_url = str_replace('//include', '/include', SB_URL . '/include/ajax.php');
    $code = '<script data-cfasync="false">';
    $code .= 'var SB_AJAX_URL = "' . $ajax_url . '";';
    $code .= 'var SB_URL = "' . SB_URL . '";';
    $code .= 'var SB_LANG = ' . ($SB_LANGUAGE ? json_encode($SB_LANGUAGE) : 'false') . ';';
    $code .= '</script>';
    echo $code;
}

function sb_get_block_setting($value) {
    switch ($value) {
        case 'privacy':
            $settings = sb_get_setting('privacy');
            return $settings && $settings['privacy-active'] ? ['title' => sb_rich_value($settings['privacy-title']), 'message' => sb_rich_value($settings['privacy-msg']), 'decline' => sb_rich_value($settings['privacy-msg-decline']), 'link' => $settings['privacy-link'], 'link-name' => sb_rich_value(sb_isset($settings, 'privacy-link-text', ''), false), 'btn-approve' => sb_rich_value($settings['privacy-btn-approve'], false), 'btn-decline' => sb_rich_value($settings['privacy-btn-decline'], false)] : false;
        case 'popup':
            $settings = sb_get_setting('popup-message');
            return $settings && $settings['popup-active'] ? ['title' => sb_rich_value($settings['popup-title']), 'message' => sb_rich_value(nl2br($settings['popup-msg'])), 'image' => $settings['popup-image']] : false;
        case 'welcome':
            $settings = sb_get_setting('welcome-message');
            return $settings && $settings['welcome-active'] ? ['message' => sb_rich_value($settings['welcome-msg'], true, true, true), 'open' => $settings['welcome-open'], 'sound' => $settings['welcome-sound']] : false;
        case 'follow':
            $settings = sb_get_setting('follow-message');
            return $settings && $settings['follow-active'] ? ['title' => sb_rich_value($settings['follow-title']), 'message' => sb_rich_value($settings['follow-msg'], false, true), 'name' => $settings['follow-name'] ? 'true' : 'false', 'last-name' => sb_isset($settings, 'follow-last-name') ? 'true' : 'false', 'phone' => sb_isset($settings, 'follow-phone') ? 'true' : 'false', 'phone-required' => sb_isset($settings, 'follow-phone-required') ? 'true' : 'false', 'success' => sb_rich_value(str_replace('{user_name}', '{user_name_}', $settings['follow-success'])), 'placeholder' => sb_rich_value(sb_isset($settings, 'follow-placeholder', 'Email')), 'delay' => sb_isset($settings, 'follow-delay'), 'disable-office-hours' => sb_isset($settings, 'follow-disable-office-hours')] : false;
        case 'subscribe':
            $settings = sb_get_setting('subscribe-message');
            $settings_follow = sb_get_setting('follow-message');
            return $settings && sb_isset($settings, 'subscribe-active') ? ['message' => '[email id="sb-subscribe-form" title="' . sb_rich_value($settings['subscribe-title']) . '" message="' . sb_rich_value($settings['subscribe-msg'], false) . '" success="' . sb_rich_value(str_replace('{user_name}', '{user_name_}', $settings['subscribe-msg-success'])) . '" placeholder="' . sb_rich_value(sb_isset($settings, 'follow-placeholder', 'Email')) . '" name="' . ($settings_follow['follow-name'] ? 'true' : 'false') . '" last-name="' . ($settings_follow['follow-last-name'] ? 'true' : 'false') . '"]', 'sound' => $settings['subscribe-sound']] : false;
    }
    return false;
}

function sb_populate_settings($category, $settings, $echo = true) {
    if (!isset($settings) && file_exists(SB_PATH . '/resources/json/settings.json')) {
        $settings = json_decode(file_get_contents(SB_PATH . '/resources/json/settings.json'), true);
    }
    $settings = $settings[$category];
    $code = '';
    for ($i = 0; $i < count($settings); $i++) {
        $code .= sb_get_setting_code($settings[$i]);
    }
    if ($echo) {
        echo $code;
        return true;
    } else {
        return $code;
    }
}

function sb_populate_app_settings($app_name) {
    $file = SB_PATH . '/apps/' . $app_name . '/settings.json';
    $settings = [$app_name => []];
    if (file_exists($file)) {
        $settings[$app_name] = json_decode(file_get_contents($file), true);
    }
    return sb_populate_settings($app_name, $settings, false);
}

function sb_get_setting_code($setting) {
    if (isset($setting)) {
        $id = $setting['id'];
        $type = $setting['type'];
        $disable_translations = sb_get_setting('admin-disable-settings-translations');
        $content = '<div id="' . $id . '" data-type="' . $type . '"' . (isset($setting['setting']) ? ' data-setting="' . $setting['setting'] . '"' : '') . ' class="sb-setting sb-type-' . $type . '"><div class="sb-setting-content"><h2>' . sb_s($setting['title'], $disable_translations) . '</h2><p>' . sb_s($setting['content'], $disable_translations) . sb_get_setting_code_help($setting) . '</p></div><div class="input">';
        switch ($type) {
            case 'color':
                $content .= '<input type="text"><i class="sb-close sb-icon-close"></i>';
                break;
            case 'text':
                $content .= '<input type="text">';
                break;
            case 'password':
                $content .= '<input type="password">';
                break;
            case 'textarea':
                $content .= '<textarea></textarea>';
                break;
            case 'select':
                $values = $setting['value'];
                $content .= '<select>';
                for ($i = 0; $i < count($values); $i++) {
                    $content .= '<option value="' . $values[$i][0] . '">' . sb_s($values[$i][1], $disable_translations) . '</option>';
                }
                $content .= '</select>';
                break;
            case 'checkbox':
                $content .= '<input type="checkbox">';
                break;
            case 'radio':
                $values = $setting['value'];
                for ($i = 0; $i < count($values); $i++) {
                    $content .= '<div><input type="radio" name="' . $id . '" value="' . strtolower(str_replace(' ', '-', $values[$i])) . '"><label>' . $setting["value"][$i] . '</label></div>';
                }
                break;
            case 'number':
                $content .= '<input type="number">' . (isset($setting['unit']) ? '<label>' . $setting['unit'] . '</label>' : '');
                break;
            case 'upload':
                $content .= (empty($setting['text-field']) ? '' : '<input type="url">') . '<a class="sb-btn">' . sb_(sb_isset($setting, 'button-text', 'Choose file')) . '</a>';
                break;
            case 'upload-image':
                $content .= '<div class="image"' . (isset($setting['background-size']) ? ' style="background-size: ' . $setting['background-size'] . '"' : '') . '><i class="sb-icon-close"></i></div>';
                break;
            case 'input-button':
                $content .= '<input type="text"><a class="sb-btn">' . sb_s($setting['button-text'], $disable_translations) . '</a>';
                break;
            case 'button':
                $content .= '<a class="sb-btn" target="_blank" href="' . $setting['button-url'] . '">' . sb_s($setting['button-text'], $disable_translations) . '</a>';
                break;
            case 'multi-input':
                $values = $setting['value'];
                for ($i = 0; $i < count($values); $i++) {
                    $sub_type = $values[$i]['type'];
                    $content .= '<div id="' . $values[$i]['id'] . '" data-type="' . $sub_type . '" class="multi-input-' . $sub_type . '"><label>' . sb_s($values[$i]['title'], $disable_translations) . sb_get_setting_code_help($values[$i]) . '</label>';
                    switch ($sub_type) {
                        case 'text':
                            $content .= '<input type="text">';
                            break;
                        case 'password':
                            $content .= '<input type="password">';
                            break;
                        case 'number':
                            $content .= '<input type="number">';
                            break;
                        case 'textarea':
                            $content .= '<textarea></textarea>';
                            break;
                        case 'upload':
                            $content .= '<input type="url"><button type="button">' . sb_('Choose file') . '</button>';
                            break;
                        case 'upload-image':
                            $content .= '<div class="image"><i class="sb-icon-close"></i></div>';
                            break;
                        case 'checkbox':
                            $content .= '<input type="checkbox">';
                            break;
                        case 'select':
                            $content .= '<select>';
                            $items = $values[$i]['value'];
                            for ($j = 0; $j < count($items); $j++) {
                                $content .= '<option value="' . $items[$j][0] . '">' . sb_s($items[$j][1], $disable_translations) . '</option>';
                            }
                            $content .= '</select>';
                            break;
                        case 'button':
                            $content .= '<a class="sb-btn" target="_blank" href="' . $values[$i]['button-url'] . '">' . sb_s($values[$i]['button-text'], $disable_translations) . '</a>';
                            break;
                        case 'select-checkbox':
                            $items = $values[$i]['value'];
                            $content .= '<input type="text" class="sb-select-checkbox-input" readonly><div class="sb-select-checkbox">';
                            for ($i = 0; $i < count($items); $i++) {
                                $content .= '<div class="multi-input-checkbox"><input id="' . $items[$i][0] . '" type="checkbox"><label>' . sb_s($items[$i][1], $disable_translations) . '</label></div>';
                            }
                            $content .= '</div>';
                            break;
                    }
                    $content .= '</div>';
                }
                break;
            case 'range':
                $range = (key_exists('range', $setting) ? $setting['range'] : array(0, 100));
                $unit = (key_exists('unit', $setting) ? '<label>' . $setting['unit'] . '</label>' : '');
                $content .= '<label class="range-value">' . $range[0] . '</label><input type="range" min="' . $range[0] . '" max="' . $range[1] . '" value="' . $range[0] . '" />' . $unit;
                break;
            case 'repeater':
                $content .= '<div class="sb-repeater"><div class="repeater-item">';
                for ($i = 0; $i < count($setting['items']); $i++) {
                    $item = $setting['items'][$i];
                    $content .= '<div>' . (isset($item['name']) ? '<label>' . sb_s($item['name'], $disable_translations) . '</label>' : '');
                    switch ($item['type']) {
                        case 'url':
                        case 'text':
                        case 'number':
                        case 'password':
                            $content .= '<input data-id="' . $item['id'] . '" type="' . $item['type'] . '">';
                            break;
                        case 'textarea':
                            $content .= '<textarea data-id="' . $item['id'] . '"></textarea>';
                            break;
                        case 'checkbox':
                            $content .= '<input data-id="' . $item['id'] . '" type="checkbox">';
                            break;
                        case 'auto-id':
                            $content .= '<input data-type="auto-id" data-id="' . $item['id'] . '" value="1" type="text" readonly="true">';
                            break;
                        case 'hidden':
                            $content .= '<input data-id="' . $item['id'] . '" type="hidden">';
                            break;
                        case 'color-palette':
                            $content .= sb_color_palette($item['id']);
                            break;
                        case 'upload-image':
                            $content .= '<div data-type="upload-image"><div data-id="' . $item['id'] . '" class="image"><i class="sb-icon-close"></i></div></div>';
                            break;
                        case 'upload-file':
                            $content .= '<div data-type="upload-file" class="sb-flex"><input type="url" data-id="' . $item['id'] . '" disabled><a class="sb-btn">' . sb_('Choose file') . '</a></div>';
                            break;
                    }
                    $content .= '</div>';
                }
                $content .= '<i class="sb-icon-close"></i></div></div><a class="sb-btn sb-repeater-add">' . sb_('Add new item') . '</a>';
                break;
            case 'timetable':
                $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                $hours = [['', ''], ['00:00', '12:00 am'], ['00:30', '12:30 am'], ['01:00', '1:00 am'], ['01:30', '1:30 am'], ['02:00', '2:00 am'], ['02:30', '2:30 am'], ['03:00', '3:00 am'], ['03:30', '3:30 am'], ['04:00', '4:00 am'], ['04:30', '4:30 am'], ['05:00', '5:00 am'], ['05:30', '5:30 am'], ['06:00', '6:00 am'], ['06:30', '6:30 am'], ['07:00', '7:00 am'], ['07:30', '7:30 am'], ['08:00', '8:00 am'], ['08:30', '8:30 am'], ['09:00', '9:00 am'], ['09:30', '9:30 am'], ['10:00', '10:00 am'], ['10:30', '10:30 am'], ['11:00', '11:00 am'], ['11:30', '11:30 am'], ['12:00', '12:00 pm'], ['12:30', '12:30 pm'], ['13:00', '1:00 pm'], ['13:30', '1:30 pm'], ['14:00', '2:00 pm'], ['14:30', '2:30 pm'], ['15:00', '3:00 pm'], ['15:30', '3:30 pm'], ['16:00', '4:00 pm'], ['16:30', '4:30 pm'], ['17:00', '5:00 pm'], ['17:30', '5:30 pm'], ['18:00', '6:00 pm'], ['18:30', '6:30 pm'], ['19:00', '7:00 pm'], ['19:30', '7:30 pm'], ['20:00', '8:00 pm'], ['20:30', '8:30 pm'], ['21:00', '9:00 pm'], ['21:30', '9:30 pm'], ['22:00', '10:00 pm'], ['22:30', '10:30 pm'], ['23:00', '11:00 pm'], ['23:30', '11:30 pm'], ['closed', sb_('Closed')]];
                $select = '<div class="sb-custom-select">';
                for ($i = 0; $i < count($hours); $i++) {
                    $select .= '<span data-value="' . $hours[$i][0] . '">' . $hours[$i][1] . '</span>';
                }
                $content .= '<div class="sb-timetable">';
                for ($i = 0; $i < 7; $i++) {
                    $content .= '<div data-day="' . strtolower($days[$i]) . '"><label>' . sb_($days[$i]) . '</label><div><div></div><span>' . sb_('To') . '</span><div></div><span>' . sb_('And') . '</span><div></div><span>' . sb_('To') . '</span><div></div></div></div>';
                }
                $content .= $select . '</div></div>';
                break;
            case 'select-images':
                $content .= '<div class="sb-icon-close"></div>';
                for ($i = 0; $i < count($setting['images']); $i++) {
                    $content .= '<div data-value="' . $setting['images'][$i] . '" style="background-image: url(\'' . SB_URL . '/media/' . $setting['images'][$i] . '\')"></div>';
                }
                break;
            case 'select-checkbox':
                $values = $setting['value'];
                $content .= '<select disabled><option>AA</option></select><div class="sb-select-checkbox">';
                for ($i = 0; $i < count($values); $i++) {
                    $content .= '<div id="' . $values[$i]['id'] . '" data-type="checkbox" class="multi-input-checkbox"><input type="checkbox"><label>' . sb_s($values[$i]['title'], $disable_translations) . '</label></div>';
                }
                $content .= '</div>';
                break;
        }
        if (isset($setting['setting']) && ($type == 'multi-input' || !empty($setting['multilingual']))) {
            $content .= '<div class="sb-language-switcher-cnt"><label>' . sb_('Languages') . '</label></div>';
        }
        return $content . '</div></div>';
    }
    return '';
}

function sb_get_setting_code_help($setting) {
    return isset($setting['help']) && (!sb_is_cloud() || defined('SB_CLOUD_DOCS')) ? '<a href="' . (defined('SB_CLOUD_DOCS') ? (SB_CLOUD_DOCS . substr($setting['help'], strpos($setting['help'], '#'))) : $setting['help']) . '" target="_blank" class="sb-icon-help"></a>' : '';
}

function sb_save_settings($settings, $external_settings = [], $external_settings_translations = []) {
    if (isset($settings)) {
        global $SB_SETTINGS;
        if (is_string($settings))
            $settings = json_decode($settings, true);
        $settings_encoded = sb_db_json_escape($settings);
        if (isset($settings_encoded) && is_string($settings_encoded)) {

            // Save main settings
            $query = 'INSERT INTO sb_settings(name, value) VALUES (\'settings\', \'' . $settings_encoded . '\') ON DUPLICATE KEY UPDATE value = \'' . $settings_encoded . '\'';
            $result = sb_db_query($query);
            if (sb_is_error($result)) {
                return $result;
            }

            // Save external settings
            foreach ($external_settings as $key => $value) {
                sb_save_external_setting($key, $value);
            }

            // Save external settings translations
            $db = '';
            foreach ($external_settings_translations as $key => $value) {
                $name = 'external-settings-translations-' . $key;
                sb_save_external_setting($name, $value);
                $db .= '"' . $name . '",';
            }
            if ($db)
                sb_db_query('DELETE FROM sb_settings WHERE name LIKE "external-settings-translations-%" AND name NOT IN (' . substr($db, 0, -1) . ')');

            // Update bot
            sb_update_bot($settings['bot-name'][0], $settings['bot-image'][0]);

            $SB_SETTINGS = $settings;
            return true;
        } else {
            return sb_error('json-encode-error', 'sb_save_settings');
        }
    } else {
        return sb_error('settings-not-found', 'sb_save_settings');
    }
}

function sb_save_external_setting($name, $value) {
    $settings_encoded = sb_db_json_escape($value);
    return JSON_ERROR_NONE !== json_last_error() ? json_last_error_msg() : sb_db_query('INSERT INTO sb_settings(name, value) VALUES (\'' . sb_db_escape($name) . '\', \'' . $settings_encoded . '\') ON DUPLICATE KEY UPDATE value = \'' . $settings_encoded . '\'');
}

function sb_get_settings() {
    global $SB_SETTINGS;
    if (!isset($SB_SETTINGS)) {
        $SB_SETTINGS = sb_get_external_setting('settings', []);
        if (isset($GLOBALS['SB_LOCAL_SETTINGS']))
            $SB_SETTINGS = array_merge($SB_SETTINGS, $GLOBALS['SB_LOCAL_SETTINGS']);
    }
    return $SB_SETTINGS;
}

function sb_get_all_settings() {
    $translations = [];
    $settings = [];
    $rows = sb_db_get('SELECT value FROM sb_settings WHERE name="emails" || name="rich-messages" || name="wc-emails"', false);
    for ($i = 0; $i < count($rows); $i++) {
        $settings = array_merge($settings, json_decode($rows[$i]['value'], true));
    }
    $rows = sb_db_get('SELECT name, value FROM sb_settings WHERE name LIKE "external-settings-translations-%"', false);
    for ($i = 0; $i < count($rows); $i++) {
        $translations[substr($rows[$i]['name'], -2)] = json_decode($rows[$i]['value'], true);
    }
    return array_merge(sb_get_settings(), $settings, ['external-settings-translations' => $translations]);
}

function sb_get_setting($id, $default = false) {
    $settings = sb_get_settings();
    if (!sb_is_error($settings)) {
        if (isset($settings[$id]) && !empty($settings[$id][0])) {
            $setting = $settings[$id][0];
            if (is_array($setting) && !isset($setting[0])) {
                $settings_result = [];
                foreach ($setting as $key => $value) {
                    $settings_result[$key] = $value[0];
                }
                return $settings_result;
            } else {
                return $setting;
            }
        } else {
            return $default;
        }
    } else {
        return $settings;
    }
}

function sb_get_multi_setting($id, $sub_id, $default = false) {
    $setting = sb_get_setting($id);
    if ($setting && !empty($setting[$sub_id])) {
        return $setting[$sub_id];
    }
    return $default;
}

function sb_get_external_setting($name, $default = false) {
    $result = sb_db_get('SELECT value FROM sb_settings WHERE name = "' . sb_db_escape($name) . '"', false);
    $settings = [];
    if (empty($result))
        return $default;
    if (sb_is_error($settings))
        return $settings;
    if (!is_array($result)) {
        return $result;
    }
    if (count($result) == 1) {
        return json_decode($result[0]['value'], true);
    }
    for ($i = 0; $i < count($result); $i++) {
        $settings = array_merge($settings, json_decode($result[$i]['value'], true));
    }
    return $settings;
}

function sb_get_multilingual_setting($name, $sub_name, $language = false) {
    $language = $language ? $language : sb_get_user_language();
    $value = $language && $language != 'en' ? sb_isset(sb_get_external_setting('external-settings-translations-' . $language), $sub_name) : false;
    if ($value)
        return $value;
    $value = sb_isset(sb_get_external_setting($name), $sub_name);
    if ($value && is_array($value)) {
        $value = $value[0];
        if (!empty($value) && !is_string($value) && array() !== $value) {
            foreach ($value as $key => $setting) {
                $value[$key] = $setting[0];
            }
        }
    }
    return $value;
}

function sb_color_palette($id = '') {
    return '<div data-type="color-palette" data-value="" data-id="' . $id . '" class="sb-color-palette"><span></span><ul><li data-value=""></li><li data-value="red"></li><li data-value="yellow"></li><li data-value="green"></li><li data-value="pink"></li><li data-value="gray"></li><li data-value="blue"></li></ul></div>';
}

function sb_export_settings() {
    $setting_keys = ['automations', 'emails', 'rich-messages', 'settings', 'app-keys', 'articles', 'articles-categories', 'dialogflow-knowledge', 'open-ai-intents-history', 'slack-channels'];
    $settings = [];
    for ($i = 0; $i < count($setting_keys); $i++) {
        $value = sb_isset(sb_db_get('SELECT value FROM sb_settings WHERE name = "' . $setting_keys[$i] . '"'), 'value');
        if ($value) {
            $value = json_decode($value, true);
            if ($value)
                $settings[$setting_keys[$i]] = $value;
        }
    }
    $settings = json_encode($settings, JSON_INVALID_UTF8_IGNORE);
    if ($settings) {
        $name = 'settings' . '_' . rand(100000, 999999999) . '.json';
        $response = sb_file(SB_PATH . '/uploads/' . $name, $settings);
        return $response ? (SB_URL . '/uploads/' . $name) : $response;
    }
    return JSON_ERROR_NONE !== json_last_error() ? json_last_error_msg() : false;
}

function sb_import_settings($file_url) {
    $settings = json_decode(sb_download($file_url), true);
    if ($settings) {
        foreach ($settings as $key => $setting) {
            sb_save_external_setting($key, $setting);
        }
        sb_file_delete(SB_PATH . substr($file_url, strpos($file_url, '/uploads/')));
        return true;
    }
    return JSON_ERROR_NONE !== json_last_error() ? json_last_error_msg() : false;
}

function sb_get_departments() {
    $items = sb_get_setting('departments');
    $count = is_array($items) ? count($items) : 0;
    $departments = [];
    for ($i = 0; $i < $count; $i++) {
        $departments[$items[$i]['department-id']] = ['name' => sb_($items[$i]['department-name']), 'color' => $items[$i]['department-color'], 'image' => sb_isset($items[$i], 'department-image', '')];
    }
    return $departments;
}

function sb_departments($type) {
    $items = sb_get_setting('departments');
    $count = is_array($items) ? count($items) : 0;
    if ($count) {
        switch ($type) {
            case 'select':
                $code = '<div id="department" data-type="select" class="sb-input sb-input-select"><span>' . sb_('Department') . '</span><select><option value=""></option>';
                for ($i = 0; $i < $count; $i++) {
                    $code .= '<option value="' . $items[$i]['department-id'] . '">' . ucfirst(sb_($items[$i]['department-name'])) . '</option>';
                }
                echo $code . '</select></div>';
                break;
            case 'custom-select':
                $code = '<div class="sb-inline sb-inline-departments"><h3>' . sb_('Department') . '</h3><div id="conversation-department" class="sb-select sb-select-colors"><p>' . sb_('None') . '</p><ul><li data-id="" data-value="">' . sb_('None') . '</li>';
                for ($i = 0; $i < $count; $i++) {
                    $id = $items[$i]['department-id'];
                    $code .= '<li data-id="' . $id . '" data-value="' . sb_isset($items[$i], 'department-color', $id) . '">' . ucfirst(sb_($items[$i]['department-name'])) . '</li>';
                }
                echo $code . '</ul></div></div>';
                break;
            case 'dashboard':
                $settings = sb_get_setting('departments-settings');
                if ($settings) {
                    $is_image = sb_isset($settings, 'departments-images') && sb_isset($items[0], 'department-image');
                    $code = '<div class="sb-dashboard-departments"><div class="sb-title">' . sb_(sb_isset($settings, 'departments-title', 'Departments')) . '</div><div class="sb-departments-list">';
                    for ($i = 0; $i < $count; $i++) {
                        $code .= '<div data-id="' . $items[$i]['department-id'] . '">' . ($is_image ? '<img src="' . $items[$i]['department-image'] . '">' : '<div data-color="' . sb_isset($items[$i], 'department-color') . '"></div>') . '<span>' . sb_($items[$i]['department-name']) . '</span></div>';
                    }
                    echo $code . '</div></div>';
                    break;
                }
        }
    }
}

function sb_office_hours() {
    $settings = sb_get_settings();
    $timetable = sb_isset($settings, 'timetable', [[]])[0];
    $now = time();
    $offset = intval(sb_get_setting('timetable-utc', 0));
    $offset_2 = $now - ($offset * 3600);
    $today = strtolower(gmdate('l', $offset_2));
    $today_array = explode('-', gmdate('m-d-y', $offset_2));
    $today_array = [intval($today_array[0]), intval($today_array[1]), intval($today_array[2])];
    if (isset($timetable[$today]) && !empty($timetable[$today][0][0])) {
        $status = false;
        for ($i = 0; $i < 3; $i += 2) {
            if (!empty($timetable[$today][$i][0]) && $timetable[$today][$i][0] != 'closed') {
                $start = explode(':', $timetable[$today][$i][0]);
                $end = explode(':', $timetable[$today][$i + 1][0]);
                $office_hours_start = gmmktime(intval($start[0]) + $offset, intval($start[1]), 0, $today_array[0], $today_array[1], $today_array[2]);
                $office_hours_end = gmmktime(intval($end[0]) + $offset, intval($end[1]), 0, $today_array[0], $today_array[1], $today_array[2]);
                if ($now >= $office_hours_start && $now <= $office_hours_end)
                    $status = true;
            }
        }
        return $status;
    }
    return true;
}

function sb_css($color_1 = false, $color_2 = false, $color_3 = false, $return = false) {
    $css = '';
    $color_1 = $color_1 ? $color_1 : sb_get_setting('color-1');
    $color_2 = $color_2 ? $color_2 : sb_get_setting('color-2');
    $color_3 = $color_3 ? $color_3 : sb_get_setting('color-3');
    $chat_button_offset_top = sb_get_multi_setting('chat-button-offset', 'chat-button-offset-top');
    $chat_button_offset_bottom = sb_get_multi_setting('chat-button-offset', 'chat-button-offset-bottom');
    $chat_button_offset_right = sb_get_multi_setting('chat-button-offset', 'chat-button-offset-right');
    $chat_button_offset_left = sb_get_multi_setting('chat-button-offset', 'chat-button-offset-left');
    $chat_button_offset_left_mobile = sb_get_multi_setting('chat-button-offset', 'chat-button-offset-mobile');
    $chat_button_offset_left_mobile = $chat_button_offset_left_mobile == 'desktop' ? ['@media (min-width: 768px) {', '}'] : ($chat_button_offset_left_mobile == 'mobile' ? ['@media (max-width: 768px) {', '}'] : ['', '']);
    if ($color_1) {
        $css .= '.sb-chat-btn, .sb-chat>div>.sb-header,.sb-chat .sb-dashboard>div>.sb-btn:hover,.sb-chat .sb-scroll-area .sb-header,.sb-input.sb-input-btn>div,div ul.sb-menu li:hover,
                 .sb-select ul li:hover,.sb-popup.sb-emoji .sb-emoji-bar>div.sb-active, .sb-popup.sb-emoji .sb-emoji-bar>div:hover,.sb-btn,a.sb-btn,.sb-rich-message[disabled] .sb-buttons .sb-btn,
                 .sb-ul>span:before,.sb-article-category-links>span+span:before { background-color: ' . $color_1 . '; }';
        $css .= '.sb-chat .sb-dashboard>div>.sb-btn,.sb-search-btn>input,.sb-input>input:focus, .sb-input>select:focus, .sb-input>textarea:focus,
                 .sb-input.sb-input-image .image:hover { border-color: ' . $color_1 . '; }';
        $css .= '.sb-chat .sb-dashboard>div>.sb-btn,.sb-editor .sb-bar-icons>div:hover:before,.sb-articles>div:hover>div,.sb-main .sb-btn-text:hover,.sb-editor .sb-submit,.sb-table input[type="checkbox"]:checked:before,
                 .sb-select p:hover,div ul.sb-menu li.sb-active, .sb-select ul li.sb-active,.sb-search-btn>i:hover,.sb-search-btn.sb-active i,.sb-rich-message .sb-input>span.sb-active:not(.sb-filled),
                 .sb-input.sb-input-image .image:hover:before,.sb-rich-message .sb-card .sb-card-btn,.sb-slider-arrow:hover,.sb-loading:not(.sb-btn):before,.sb-articles>div.sb-title,.sb-article-categories>div:hover, .sb-article-categories>div.sb-active,
                 .sb-article-categories>div span:hover,.sb-article-categories>div span.sb-active,.sb-btn-text:hover,.sb-player > div:hover { color: ' . $color_1 . '; }';
        $css .= '.sb-search-btn>input:focus,.sb-input>input:focus, .sb-input>select:focus, .sb-input>textarea:focus,.sb-input.sb-input-image .image:hover { box-shadow: 0 0 5px rgba(104, 104, 104, 0.2); }';
        $css .= '.sb-list>div.sb-rich-cnt { border-top-color: ' . $color_1 . '; }';
        $css .= '.sb-list>div.sb-right .sb-message, .sb-list>div.sb-right .sb-message a { color: #566069; } .sb-list>div.sb-right { background-color: #f0f0f0; }';
    }
    if ($color_2) {
        $css .= '.sb-chat-btn:hover,.sb-input.sb-input-btn>div:hover,.sb-btn:hover,a.sb-btn:hover,.sb-rich-message .sb-card .sb-card-btn:hover { background-color: ' . $color_2 . '; }';
        $css .= '.sb-list>.sb-right .sb-message, .sb-list>.sb-right .sb-message a,.sb-editor .sb-submit:hover { color: ' . $color_2 . '; }';
    }
    if ($color_3) {
        $css .= '.sb-list>.sb-right,.sb-user-conversations>li:hover { background-color: ' . $color_3 . '; }';
    }
    if ($chat_button_offset_top) {
        $css .= $chat_button_offset_left_mobile[0] . '.sb-chat-btn { top: ' . $chat_button_offset_top . 'px; }' . $chat_button_offset_left_mobile[1];
    }
    if ($chat_button_offset_bottom) {
        $css .= $chat_button_offset_left_mobile[0] . '.sb-chat-btn { bottom: ' . $chat_button_offset_bottom . 'px; }' . $chat_button_offset_left_mobile[1];
    }
    if ($chat_button_offset_right) {
        $css .= $chat_button_offset_left_mobile[0] . '.sb-chat-btn { right: ' . $chat_button_offset_right . 'px; }' . $chat_button_offset_left_mobile[1];
    }
    if ($chat_button_offset_left) {
        $css .= $chat_button_offset_left_mobile[0] . '.sb-chat-btn { left: ' . $chat_button_offset_left . 'px; }' . $chat_button_offset_left_mobile[1];
    }
    if ($return)
        return $css;
    if ($css) {
        echo '<style>' . $css . '</style>';
    }
    return false;
}

function sb_system_requirements() {
    $checks = [];

    // PHP version
    $checks['php-version'] = version_compare(PHP_VERSION, '7.2.0') >= 0;

    // ZipArchive
    $checks['zip-archive'] = class_exists('ZipArchive');

    // File permissions
    $permissions = [['plugin', SB_PATH], ['uploads', sb_upload_path()], ['apps', SB_PATH . '/apps'], ['languages', SB_PATH . '/resources/languages']];
    for ($i = 0; $i < count($permissions); $i++) {
        $path = $permissions[$i][1] . '/sb-permissions-check.txt';
        sb_file($path, 'permissions-check');
        $checks[$permissions[$i][0] . '-folder'] = file_exists($path) && strpos(file_get_contents($path), 'permissions-check');
        if (file_exists($path)) {
            unlink($path);
        }
    }

    // AJAX file
    $checks['ajax'] = function_exists('curl_init') && sb_download(SB_URL . '/include/ajax.php') == 'true';

    // cURL
    $checks['curl'] = function_exists('curl_version') && is_array(sb_get_versions());

    // MySQL UTF8MB4 support
    $checks['UTF8mb4'] = !sb_is_error(sb_db_query('SET NAMES UTF8mb4'));

    return $checks;
}

function sb_select_countries() {
    $code = '<select><option value=""></option>';
    $countries = array_keys(json_decode(file_get_contents(SB_PATH . '/resources/json/countries.json'), true));
    for ($i = 0; $i < count($countries); $i++) {
        $code .= '<option value="' . $countries[$i] . '">' . sb_($countries[$i]) . '</option>';
    }
    return $code . '</select>';
}

function sb_select_languages() {
    $code = '<select><option value=""></option>';
    $languages = json_decode(file_get_contents(SB_PATH . '/resources/languages/language-codes.json'), true);
    foreach ($languages as $key => $value) {
        $code .= '<option value="' . $key . '">' . sb_($value) . '</option>';
    }
    return $code . '</select>';
}

function sb_select_phone() {
    $single = sb_get_setting('phone-code');
    if ($single) {
        return $single;
    } else {
        $code = '<select><option value=""></option>';
        $phones = array_values(json_decode(file_get_contents(SB_PATH . '/resources/json/phone.json'), true));
        for ($i = 0; $i < count($phones); $i++) {
            $code .= '<option value="+' . $phones[$i] . '">+' . $phones[$i] . '</option>';
        }
        return $code . '</select>';
    }
}

function sb_get_config_details($path) {
    $details = [];
    $slugs = ['SB_URL', 'SB_DB_NAME', 'SB_DB_USER', 'SB_DB_PASSWORD', 'SB_DB_HOST', 'SB_DB_PORT'];
    $lines = preg_split("/\r\n|\n|\r/", file_get_contents($path));
    for ($i = 0; $i < count($lines); $i++) {
        $line = $lines[$i];
        for ($j = 0; $j < count($slugs); $j++) {
            if (strpos($line, $slugs[$j])) {
                $details[$slugs[$j]] = str_replace(['define(\'' . $slugs[$j] . '\', \'', '\');'], '', $line);
            }
        }
    }
    return $details;
}

/*
 * -----------------------------------------------------------
 * ARTICLES
 * -----------------------------------------------------------
 *
 * 1. Save all articles
 * 2. Save all articles categories
 * 3. Returns all articles
 * 4. Returns all articles categories
 * 5. Search articles
 * 6. Article ratings
 *
 */

function sb_save_articles($articles, $categories = false, $translations = false) {
    if (is_string($articles)) {
        $articles = json_decode($articles, true);
    }
    if ($translations && is_string($translations)) {
        $translations = json_decode($translations, true);
    }
    if ($categories == 'delete_all') {
        sb_save_external_setting('articles-categories', []);
    } else if ($categories) {
        sb_save_external_setting('articles-categories', $categories);
    }
    $db = '';
    if ($translations) {
        foreach ($translations as $key => $value) {
            $name = 'articles-translations-' . $key;
            sb_save_external_setting($name, $value);
            $db .= '"' . $name . '",';
        }
    }
    sb_db_query('DELETE FROM sb_settings WHERE name LIKE "articles-translations-%"' . ($db ? ' AND name NOT IN (' . substr($db, 0, -1) . ')' : ''));
    return sb_save_external_setting('articles', $articles);
}

function sb_save_articles_categories($categories) {
    return sb_save_external_setting('articles-categories', $categories);
}

function sb_get_articles($article_id = false, $count = false, $full = false, $categories = false, $language = false) {
    $languages_all = $language == 'all';
    if ($language == 'en') {
        $language = false;
    }
    $articles = sb_get_external_setting($language && !$languages_all ? 'articles-translations-' . $language : 'articles');
    $articles_translations = [];
    $return = [];
    $category = $categories && $categories != 'true' && !is_bool($categories) ? $categories : false;
    if ($language && empty($articles)) {
        $articles = sb_get_external_setting('articles');
    }
    if ($articles) {
        $is_id = !empty($article_id) && $article_id !== -1;
        $article_id = is_array($article_id) ? $article_id : explode(',', str_replace(' ', '', $article_id));
        $single_article = $is_id && count($article_id) == 1;
        $count_return = 0;
        for ($i = 0; $i < count($articles); $i++) {
            $article = $articles[$i];
            if ($single_article) {
                if (in_array($article['id'], $article_id)) {
                    sb_reports_update('articles-views', false, false, $article['id']);
                    array_push($return, $article);
                    break;
                }
            } else if (!empty($article['title']) && (!$is_id || in_array($article['id'], $article_id)) && (!$category || in_array($category, sb_isset($article, 'categories', [])) || $category == sb_isset($article, 'parent_category'))) {
                array_push($return, $article);
                $count_return++;
                if ($count !== false && $count_return == $count)
                    break;
            }
        }
        if (!$full) {
            for ($i = 0; $i < count($return); $i++) {
                $content = $return[$i]['content'];
                if (strlen($content) > 100) {
                    $content = mb_substr($content, 0, 100) . '...';
                }
                $return[$i]['content'] = strip_tags($content);
            }
        }
        if ($count || $single_article) {
            return empty($return) ? false : (count($return) > 1 ? $return : $return[0]);
        }
    }
    if ($languages_all) {
        $rows = sb_db_get('SELECT name, value FROM sb_settings WHERE name LIKE "articles-translations-%"', false);
        for ($i = 0; $i < count($rows); $i++) {
            $articles_translations[substr($rows[$i]['name'], -2)] = json_decode($rows[$i]['value'], true);
        }
    }
    return ($categories !== false && $categories !== 'false') || $languages_all ? [$return, sb_get_articles_categories(), $articles_translations] : $return;
}

function sb_get_articles_categories() {
    return sb_get_external_setting('articles-categories', []);
}

function sb_search_articles($search, $language = false) {
    $articles = sb_get_external_setting($language ? 'articles-translations-' . $language : 'articles');
    $return = [];
    $search = strtolower($search);
    if ($language && empty($articles))
        $articles = sb_get_external_setting('articles');
    if ($articles) {
        for ($i = 0; $i < count($articles); $i++) {
            if (strpos(strtolower($articles[$i]['title']), $search) !== false || strpos(strtolower($articles[$i]['content']), $search)) {
                $articles[$i]['content'] = mb_substr(strip_tags($articles[$i]['content']), 0, 100);
                array_push($return, $articles[$i]);
            }
        }
    }
    sb_reports_update('articles-searches', $search);
    return $return;
}

function sb_article_ratings($article_id, $rating = false) {
    $article_id = sb_db_escape($article_id);
    $rating = $rating ? sb_db_escape($rating) : false;
    $now = gmdate('Y-m-d');
    $ratings = sb_isset(sb_db_get('SELECT value FROM sb_reports WHERE name = "article-ratings" AND extra = "' . sb_db_escape($article_id) . '" AND creation_time = "' . $now . '"'), 'value', []);
    if ($rating) {
        if (empty($ratings)) {
            return sb_db_query('INSERT INTO sb_reports (name, value, creation_time, external_id, extra) VALUES ("article-ratings", "[' . $rating . ']", "' . $now . '", NULL, "' . $article_id . '")');
        } else {
            $ratings = json_decode($ratings);
            array_push($ratings, intval($rating));
            return sb_db_query('UPDATE sb_reports SET value = "' . json_encode($ratings) . '" WHERE name = "article-ratings" AND extra = "' . $article_id . '"');
        }
    }
    return $ratings;
}

?>
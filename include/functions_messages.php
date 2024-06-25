<?php

/*
 * ==========================================================
 * FUNCTIONS_MESSAGES.PHP
 * ==========================================================
 *
 * Messages functions file. © 2017-2024 board.support. All rights reserved.
 *
 * -----------------------------------------------------------
 * CONVERSATIONS
 * -----------------------------------------------------------
 *
 * 1. Return the user details of each conversation. This function is used internally by other functions.
 * 2. Return the messages grouped by conversation
 * 3. Return only the conversations or messages older than the given date
 * 4. Return only the messages older than the given date of the conversation with the given ID
 * 5. Return only the conversations older than the given date of the user with the given ID
 * 6. Return the messages of the conversation with the given ID
 * 7. Search conversations by searching user details and messages contents
 * 8. Search conversations of the user with the given ID
 * 9. Create a new user covnersation and return the ID
 * 10. Return all the conversations of a user
 * 11. Return the ID of the last user conversation if any, otherwise create a new conversation and return its ID
 * 12. Update a conversation status with one of the allowed stutus:  live = 0, pending = 1, pending user = 2, archive = 3, trash = 4.
 * 13. Update the conversation department and alert the agents of that department
 * 14. Update the agent assigned to a conversation and alert the agent
 * 15. Save a conversation as a CSV file
 * 16. Internal notes
 * 17. Direct message
 * 18. Return an array with all agents who replied to a conversation
 * 19. Verify if the active user is an agent or if the given conversation is owned by the active user
 * 20. Set or update the conversation opened by the agent in the admin area
 * 21. Check if a conversation is currently opened by an agent
 * 22. Count conversations
 * 23. Send all notifications types to all validated agents
 * 24. Check if the given conversation are assigned to a department or agent
 * 25. Return the ID of the last agent of a conversation
 * 26. Get the last message of a converation
 * 27. Delete conversation attachments
 * 28. Update the messages status
 * 29. Update tags
 * 30. Follow-up message
 *
 */

const SELECT_CONVERSATIONS = 'SELECT A.message, A.id AS `message_id`, A.attachments, A.payload, A.status_code AS `message_status_code`, A.creation_time AS `last_update_time`, B.id AS `message_user_id`, B.first_name AS `message_first_name`, B.last_name AS `message_last_name`, B.profile_image AS `message_profile_image`, B.user_type AS `message_user_type`, C.id AS `conversation_id`, C.user_id AS `conversation_user_id`, C.status_code AS `conversation_status_code`, C.creation_time AS `conversation_creation_time`, C.department, C.agent_id, C.title, C.source, C.extra, C.tags FROM sb_messages A, sb_users B, sb_conversations C ';

function sb_get_conversations_users($conversations) {
    if (count($conversations) > 0) {
        $code = '(';
        for ($i = 0; $i < count($conversations); $i++) {
            $code .= sb_db_escape($conversations[$i]['conversation_id']) . ',';
        }
        $code = substr($code, 0, -1) . ')';
        $result = sb_db_get('SELECT sb_users.id, sb_users.first_name, sb_users.last_name, sb_users.profile_image, sb_users.user_type, sb_conversations.id AS `conversation_id` FROM sb_users, sb_conversations WHERE sb_users.id = sb_conversations.user_id AND sb_conversations.id IN ' . $code, false);
        for ($i = 0; $i < count($conversations); $i++) {
            $conversation_id = $conversations[$i]['conversation_id'];
            for ($j = 0; $j < count($result); $j++) {
                if ($conversation_id == $result[$j]['conversation_id']) {
                    $conversations[$i]['conversation_user_id'] = $result[$j]['id'];
                    $conversations[$i]['conversation_first_name'] = $result[$j]['first_name'];
                    $conversations[$i]['conversation_last_name'] = $result[$j]['last_name'];
                    $conversations[$i]['conversation_profile_image'] = $result[$j]['profile_image'];
                    $conversations[$i]['conversation_user_type'] = $result[$j]['user_type'];
                    break;
                }
            }
        }
    }
    return $conversations;
}

function sb_get_conversations($pagination = 0, $status_code = 0, $department = false, $source = false, $tag = false) {
    $exclude_visitors = '';
    if ($status_code == 3) {
        $ids = sb_db_get('SELECT A.id FROM sb_conversations A, sb_users B WHERE B.user_type <> "visitor" AND A.user_id = B.id', false);
        for ($i = 0; $i < count($ids); $i++) {
            $exclude_visitors .= $ids[$i]['id'] . ',';
        }
        if ($exclude_visitors) {
            $exclude_visitors = 'AND C.id IN (' . substr($exclude_visitors, 0, -1) . ')';
        }
    }
    if (!$pagination) {
        $pagination = 0;
    }
    if (!$status_code) {
        $status_code = 0;
    }
    $query = SELECT_CONVERSATIONS . 'WHERE B.id = A.user_id ' . ($status_code === 'all' ? '' : ($status_code == 0 ? ' AND C.status_code <> 3 AND C.status_code <> 4' : ' AND C.status_code = ' . sb_db_escape($status_code))) . ' AND C.id = A.conversation_id' . ($source !== false ? ' AND ' . ($source === '' ? '(C.source IS NULL OR C.source = "")' : 'C.source = "' . sb_db_escape($source) . '"') : '') . ($tag ? ' AND C.tags LIKE "%' . sb_db_escape($tag) . '%"' : '') . (sb_get_agent_department() === false && $department ? ' AND C.department = ' . sb_db_escape($department, true) : '') . sb_routing_and_department_db('C') . ' AND A.id IN (SELECT max(id) FROM sb_messages WHERE message <> "" OR attachments <> "" GROUP BY conversation_id) ' . $exclude_visitors . ' GROUP BY conversation_id ORDER BY ' . (sb_get_setting('order-by-date') ? '' :  'FIELD(C.status_code, 2) DESC,') . 'A.id DESC LIMIT ' . (intval(sb_db_escape($pagination, true)) * 100) . ',100';
    $result = sb_db_get($query, false);
    if (isset($result) && is_array($result)) {   
        return sb_get_conversations_users($result);
    } else {
        return sb_error('db-error', 'sb_get_conversations', $result);
    }
}

function sb_get_new_conversations($datetime, $department = false, $source = false, $tag = false) {
    $datetime = sb_db_escape($datetime);
    $result = sb_db_get(SELECT_CONVERSATIONS . 'WHERE A.id IN (SELECT max(id) FROM sb_messages WHERE ' . (is_numeric($datetime) ? ('id > ' . $datetime) : ('creation_time > "' . $datetime . '"')) . ' GROUP BY conversation_id) AND B.id = A.user_id AND C.id = A.conversation_id' . sb_routing_and_department_db('C') . ($source !== false ? ' AND ' . ($source === '' ? '(C.source IS NULL OR C.source = "")' : 'C.source = "' . sb_db_escape($source) . '"') : '') . ($tag ? ' AND C.tags LIKE "%' . sb_db_escape($tag) . '%"' : '') . ($department ? ' AND C.department = ' . sb_db_escape($department, true) : '') . ' GROUP BY conversation_id ORDER BY A.id DESC', false);
    if (isset($result) && is_array($result)) {
        return count($result) ? sb_get_conversations_users($result) : [];
    } else {
        return sb_error('db-error', 'sb_get_new_conversations', $result);
    }
}

function sb_get_new_user_conversations($user_id, $datetime) {
    $datetime = sb_db_escape($datetime);
    $user_id = sb_db_escape($user_id, true);
    return sb_db_get(SELECT_CONVERSATIONS . 'WHERE B.id = A.user_id AND A.conversation_id = C.id AND A.id IN (SELECT MAX(A.id) FROM sb_messages A, sb_conversations B WHERE A.' . (is_numeric($datetime) ? ('id > ' . $datetime) : ('creation_time > "' . $datetime . '"')) . ' AND A.conversation_id = B.id AND B.user_id = ' . $user_id . ' GROUP BY A.conversation_id) GROUP BY conversation_id ORDER BY C.id DESC', false);
}

function sb_search_conversations($search) {
    $search = trim(sb_db_escape(mb_strtolower($search)));
    $search_first = explode(' ', $search);
    if (count($search_first) < 4 && strlen($search_first[0]) > 2) {
        $search_first = $search_first[0];
    } else {
        $search_first = $search;
    }
    $result = sb_db_get(SELECT_CONVERSATIONS . 'WHERE B.id = A.user_id AND C.id = A.conversation_id' . sb_routing_and_department_db('C') . ' AND (LOWER(A.message) LIKE "%' . $search . '%" OR LOWER(A.attachments) LIKE "%' . $search . '%" OR LOWER(B.first_name) LIKE "%' . $search_first . '%" OR LOWER(B.last_name) LIKE "%' . $search_first . '%" OR LOWER(B.email) LIKE "%' . $search . '%" OR LOWER(C.title) LIKE "%' . $search . '%"' . (is_numeric($search) ? ' OR C.id = ' . $search . ' OR C.department = ' . $search . ' OR C.agent_id = ' . $search : '') . (sb_get_setting('disable-tags') ? '' : ' OR LOWER(C.tags) LIKE "%' . $search . '%"') . ') GROUP BY A.conversation_id ORDER BY A.creation_time DESC', false);
    if (isset($result) && is_array($result)) {
        return sb_get_conversations_users($result);
    } else {
        return sb_error('db-error', 'sb_search_conversations', $result);
    }
}

function sb_search_user_conversations($search, $user_id = false) {
    $search = trim(sb_db_escape(mb_strtolower($search)));
    return sb_db_get(SELECT_CONVERSATIONS . 'WHERE A.conversation_id = C.id AND B.id = C.user_id AND B.id = ' . ($user_id === false ? sb_get_active_user_ID() : sb_db_escape($user_id, true)) . ' AND (LOWER(A.message) LIKE "%' . $search . '%" OR LOWER(A.attachments) LIKE "%' . $search . '%" OR LOWER(C.title) LIKE "%' . $search . '%") GROUP BY A.conversation_id ORDER BY A.creation_time DESC', false);
}

function sb_get_user_conversations($user_id, $exclude_id = -1, $agent = false) {
    $exclude = $exclude_id != -1 ? ' AND A.conversation_id <> ' . sb_db_escape($exclude_id) : '';
    $user_id = sb_db_escape($user_id, true);
    $ids = sb_db_get($agent ? 'SELECT conversation_id AS `id` FROM sb_messages WHERE user_id = ' . $user_id . ' GROUP BY conversation_id' : 'SELECT id FROM sb_conversations WHERE user_id = ' . $user_id . ' GROUP BY id', false);
    $ids_string = '';
    $count = count($ids);
    if ($count) {
        for ($i = 0; $i < $count; $i++) {
            $ids_string .= $ids[$i]['id'] . ',';
        }
        return sb_db_get(SELECT_CONVERSATIONS . 'WHERE B.id = A.user_id' . sb_routing_and_department_db('C') . ' AND A.conversation_id = C.id AND A.id IN (SELECT max(A.id) FROM sb_messages A, sb_conversations C WHERE (A.message <> "" OR A.attachments <> "") AND A.conversation_id = C.id' . ($agent ? '' : ' AND C.user_id = ' . $user_id) . $exclude . ' GROUP BY conversation_id)' . ($ids_string ? ' AND A.conversation_id IN (' . substr($ids_string, 0, -1) . ')' : '') . ' GROUP BY conversation_id ORDER BY A.id DESC', false);
    }
    return [];
}

function sb_get_last_conversation_id_or_create($user_id, $status_code = 1) {
    $conversation_id = sb_isset(sb_db_get('SELECT id FROM sb_conversations WHERE user_id = ' . sb_db_escape($user_id, true) . ' ORDER BY id DESC LIMIT 1'), 'id');
    return $conversation_id ? $conversation_id : sb_isset(sb_isset(sb_new_conversation($user_id, $status_code), 'details'), 'id');
}

function sb_get_new_messages($user_id, $conversation_id, $last_datetime, $last_id = false) {
    $last_datetime = sb_db_escape($last_datetime);
    $last_id = $last_id ? sb_db_escape($last_id, true) : false;
    $result = sb_db_get('SELECT sb_messages.*, sb_users.first_name, sb_users.last_name, sb_users.profile_image, sb_users.user_type FROM sb_messages, sb_users, sb_conversations WHERE (sb_messages.creation_time > "' . $last_datetime . '"' . ($last_id ? (' OR sb_messages.id > ' . $last_id) : '') . ') AND sb_messages.conversation_id = ' . sb_db_escape($conversation_id, true) . ' AND sb_users.id = sb_messages.user_id AND sb_conversations.user_id = ' . sb_db_escape($user_id, true) . ' AND sb_messages.conversation_id = sb_conversations.id ORDER BY sb_messages.id ASC', false);
    return isset($result) && is_array($result) ? $result : sb_error('db-error', 'sb_get_new_messages', $result);
}

function sb_get_conversation($user_id = false, $conversation_id = false) {
    $user_id = $user_id ? sb_db_escape($user_id, true) : sb_get_active_user_ID();
    $conversation_id = sb_db_escape($conversation_id, true);
    $messages = sb_db_get('SELECT sb_messages.*, sb_users.first_name, sb_users.last_name, sb_users.profile_image, sb_users.user_type FROM sb_messages, sb_users, sb_conversations WHERE sb_messages.conversation_id = ' . $conversation_id . (sb_is_agent() ? '' : ' AND sb_conversations.user_id = ' . $user_id) . ' AND sb_messages.conversation_id = sb_conversations.id AND sb_users.id = sb_messages.user_id ORDER BY sb_messages.id ASC', false);
    if (isset($messages) && is_array($messages)) {
        $details = sb_db_get('SELECT sb_users.id as user_id, sb_users.first_name, sb_users.last_name, sb_users.profile_image, sb_users.user_type, sb_conversations.* FROM sb_users, sb_conversations WHERE sb_conversations.id = ' . $conversation_id . (sb_is_agent() ? '' : ' AND sb_users.id = ' . $user_id) . ' AND sb_users.id = sb_conversations.user_id LIMIT 1');
        if ($details) {
            if (sb_is_error($details)) {
                return $details;
            }
            $details['busy'] = false;
            if (sb_is_agent()) {
                $active_user = sb_get_active_user();
                if ($active_user) {
                    $is_queue = sb_get_multi_setting('queue', 'queue-active');
                    $is_routing = sb_get_setting('routing');
                    $is_hide_conversations = sb_get_multi_setting('agent-hide-conversations', 'agent-hide-conversations-active');
                    $is_show_unassigned_conversations = sb_get_multi_setting('agent-hide-conversations', 'agent-hide-conversations-view');
                    if ($active_user['user_type'] == 'agent' && ((!empty($active_user['department']) && $active_user['department'] != $details['department']) || ($is_hide_conversations && !$is_show_unassigned_conversations && empty($details['agent_id'])) || (!empty($details['agent_id']) && $active_user['id'] != $details['agent_id'] && ($is_queue || $is_routing || $is_hide_conversations)))) {
                        return 'agent-not-authorized';
                    }
                    if ($is_show_unassigned_conversations || (!$is_queue && !$is_routing && !$is_hide_conversations)) {
                        $agent_id = sb_is_active_conversation_busy($conversation_id, sb_get_active_user_ID());
                        if ($agent_id) {
                            $details['busy'] = sb_get_user($agent_id);
                        }
                        sb_set_agent_active_conversation($conversation_id);
                    }
                    if (!sb_get_setting('disable-notes')) {
                        $details['notes'] = sb_get_notes($conversation_id);
                    }
                    $details['tags'] = $details['tags'] ? explode(',', $details['tags']) : [];
                }
            } else if ($details['status_code'] == 1) {
                sb_update_conversation_status($conversation_id, 0);
                $details['status_code'] == 0;
            }
            return ['messages' => $messages, 'details' => $details];
        }
    } else {
        return sb_error('db-error', 'sb_get_conversation', $messages);
    }
    return false;
}

function sb_new_conversation($user_id, $status_code = 1, $title = '', $department = -1, $agent_id = -1, $source = false, $extra = false, $extra_2 = false, $extra_3 = false, $tags = false) {
    if (!sb_isset_num($agent_id)) {
        if (sb_get_setting('routing') && !sb_get_multi_setting('queue', 'queue-active')) {
            $agent_id = sb_routing(-1, $department);
        }
    } else if (defined('SB_AECOMMERCE')) {
        $agent_id = sb_aecommerce_get_agent_id($agent_id);
    }
    $user_id = sb_db_escape($user_id, true);
    $conversation_id = sb_db_query('INSERT INTO sb_conversations(user_id, title, status_code, creation_time, department, agent_id, source, extra, extra_2, extra_3, tags) VALUES (' . $user_id . ', "' . sb_db_escape(ucfirst($title)) . '", "' . ($status_code == -1 || $status_code === false || $status_code === '' ? 2 : sb_db_escape($status_code)) . '", "' . gmdate('Y-m-d H:i:s') . '", ' . (sb_isset_num($department) ? sb_db_escape($department) : 'NULL') . ', ' . (sb_isset_num($agent_id) ? sb_db_escape($agent_id, true) : 'NULL') . ', ' . ($source ? '"' . sb_db_escape($source) . '"' : 'NULL') . ', ' . ($extra ? '"' . sb_db_escape($extra) . '"' : 'NULL') . ', ' . ($extra_2 ? '"' . sb_db_escape($extra_2) . '"' : 'NULL') . ', ' . ($extra_3 ? '"' . sb_db_escape($extra_3) . '"' : 'NULL') . ', ' . ($tags ? '"' . sb_db_escape(is_string($tags) ? $tags : implode(',', $tags)) . '"' : 'NULL') . ')', true);
    if (is_numeric($conversation_id)) {
        $conversation = sb_get_conversation($user_id, $conversation_id);
        if (sb_pusher_active()) {
            sb_pusher_trigger('private-user-' . $user_id, 'new-conversation', ['conversation_user_id' => $user_id, 'conversation_id' => $conversation_id]);
        }
        sb_webhooks('SBNewConversationCreated', $conversation);
        return $conversation;
    } else if (sb_is_error($conversation_id) && sb_db_get('SELECT count(*) as count FROM sb_users WHERE id = ' . $user_id)['count'] == 0) {
        return new SBValidationError('user-not-found');
    }
    return $conversation_id;
}

function sb_update_conversation_status($conversation_id, $status) {
    $response = false;
    $conversation_id = sb_db_escape($conversation_id, true);
    $agent = sb_is_agent();
    if (in_array($status, [0, 1, 2, 3, 4])) {
        $response = sb_db_query('UPDATE sb_conversations SET status_code = ' . sb_db_escape($status) . ' WHERE id = ' . $conversation_id);
        if ($status == 3 || $status == 4) {
            sb_db_query('DELETE FROM sb_messages WHERE payload = "{\"human-takeover\":true}" AND conversation_id = ' . $conversation_id);
            $GLOBALS['human-takeover-' . $conversation_id] = false;
        }
    } else {
        if ($status == 5 && $agent) {
            $ids = sb_db_get('SELECT id FROM sb_conversations WHERE status_code = 4', false);
            for ($i = 0; $i < count($ids); $i++) {
                sb_delete_attachments($ids[$i]['id']);
            }
            $response = sb_db_query('DELETE FROM sb_conversations WHERE status_code = 4');
        } else {
            $response = new SBValidationError('invalid-status-code');
        }
    }
    if ($agent && in_array($status, [3, 4]) && sb_get_setting('logs')) {
        sb_logs('changed the status of the conversation #' . $conversation_id . ' to ' . ($status == 3 ? 'archived' : 'deleted'));
    }
    if (in_array($status, [3, 4]) && $agent) {
        sb_update_conversation_event('conversation-status-update-' . $status, $conversation_id);
    }
    if ($status == 3 && $agent && sb_pusher_active() && (sb_get_setting('close-chat') || sb_get_setting('close-ticket'))) {
        sb_pusher_trigger('private-user-' . sb_db_get('SELECT user_id FROM sb_conversations WHERE id = ' . $conversation_id)['user_id'], 'new-message');
    }
    if (($agent && $status != 2) || (!$agent && $status != 0 && $status != 1)) {
        sb_remove_email_cron($conversation_id);
    }
    sb_webhooks('SBActiveConversationStatusUpdated', ['conversation_id' => $conversation_id, 'status_code' => $status]);
    return $response;
}

function sb_update_conversation_department($conversation_id, $department, $message = false) {
    if (sb_conversation_security_error($conversation_id)) {
        return sb_error('security-error', 'sb_update_conversation_department');
    }
    $empty_department = empty($department) || $department == -1;
    $response = sb_db_query('UPDATE sb_conversations SET department = ' . ($empty_department ? 'NULL' : sb_db_escape($department)) . ' WHERE id = ' . sb_db_escape($conversation_id, true));
    if ($response) {
        if ($message) {
            sb_send_agents_notifications($message, str_replace('{T}', sb_is_agent() ? sb_get_user_name() : sb_get_setting('bot-name', 'Chatbot'), sb_('This message has been sent because {T} assigned this conversation to your department.')), $conversation_id, false, false, ['force' => true]);
        }
        sb_update_conversation_event('conversation-department-update-' . $department, $conversation_id, $message);
        if (sb_get_setting('logs')) {
            sb_logs('assigned the conversation #' . $conversation_id . ' to the department ' . ($empty_department ? 'None' : '#' . $department));
        }
        return true;
    }
    return sb_error('department-update-error', 'sb_update_conversation_department', $response);
}

function sb_update_conversation_agent($conversation_id, $agent_id, $message = false) {
    if (sb_conversation_security_error($conversation_id)) {
        return sb_error('security-error', 'sb_update_conversation_agent');
    }
    $conversation_id = sb_db_escape($conversation_id, true);
    if ($agent_id == 'routing' || $agent_id == 'routing-unassigned') {
        $agent_id = sb_routing(false, sb_isset(sb_db_get('SELECT department FROM sb_conversations WHERE id = ' . $conversation_id), 'department'), $agent_id == 'routing-unassigned');
    }
    $empty_agent_id = empty($agent_id);
    if (!$empty_agent_id && !in_array(sb_isset(sb_db_get('SELECT user_type FROM sb_users WHERE id = ' . sb_db_escape($agent_id, true)), 'user_type'), ['agent', 'admin'])) {
        return sb_error('not-an-agent', 'sb_update_conversation_agent');
    }
    $response = sb_db_query('UPDATE sb_conversations SET agent_id = ' . ($empty_agent_id ? 'NULL' : sb_db_escape($agent_id, true)) . ', status_code = 2 WHERE id = ' . $conversation_id);
    if ($response) {
        if ($message) {
            sb_send_agents_notifications($message, $empty_agent_id ? '' : str_replace('{T}', sb_is_agent() ? sb_get_user_name() : sb_get_setting('bot-name', 'Chatbot'), sb_('This message has been sent because {T} assigned this conversation to you.')), $conversation_id, false, false, ['force' => true]);
        }
        if (!$empty_agent_id) {
            sb_update_conversation_event('conversation-agent-update-' . $agent_id, $conversation_id, $message);
        }
        if (sb_get_setting('logs')) {
            sb_logs('assigned the conversation #' . $conversation_id . ' to the agent ' . ($empty_agent_id ? 'None' : '#' . $agent_id));
        }
        return true;
    }
    return sb_error('agent-update-error', 'sb_update_conversation_agent', $response);
}

function sb_update_conversation_event($payload_event, $conversation_id, $message_preview = false) {
    $payload = ['event' => $payload_event];
    if ($message_preview) {
        $payload['preview'] = $message_preview;
    }
    sb_db_query('INSERT INTO sb_messages(user_id, message, creation_time, status_code, attachments, payload, conversation_id) VALUES (' . sb_get_active_user_ID() . ', "", "' . gmdate('Y-m-d H:i:s') . '", 0, "", "' . sb_db_json_escape(json_encode($payload, JSON_INVALID_UTF8_IGNORE, JSON_UNESCAPED_UNICODE)) . '", ' . sb_db_escape($conversation_id, true) . ')');
    if (sb_pusher_active()) {
        sb_pusher_trigger('agents', 'update-conversations', ['conversation_id' => $conversation_id]);
    }
}

function sb_transcript($conversation_id, $type = false) {
    if (sb_conversation_security_error($conversation_id)) {
        return sb_error('security-error', 'sb_transcript');
    }
    $conversation = sb_db_get('SELECT id, user_id, message, creation_time, attachments, payload FROM sb_messages WHERE conversation_id = ' . sb_db_escape($conversation_id, true), false);
    $file_name = 'conversation-' . $conversation_id . '-' . rand(100000, 999999999);
    $users = [];
    if ($type === false)
        $type = sb_get_setting('transcript-type', 'txt');
    if ($type == 'csv') {
        return sb_csv($conversation, ['ID', 'User ID', 'Message', 'Creation date', 'Attachments', 'Payload'], $file_name);
    }
    if ($type == 'txt') {
        $code = '';
        for ($i = 0; $i < count($conversation); $i++) {
            $message = $conversation[$i];
            if ($message['message']) {
                $user_id = $message['user_id'];
                if (!isset($users[$user_id])) {
                    $users[$user_id] = sb_get_user_name(sb_get_user($user_id)) . ' | ID ' . $user_id . ' | ';
                }
                $code .= $users[$user_id] . $message['creation_time'] . PHP_EOL . $message['message'] . PHP_EOL . PHP_EOL;
            }
        }
        sb_file(sb_upload_path() . '/' . $file_name . '.txt', $code);
        return sb_upload_path(true) . '/' . $file_name . '.txt';
    }
    return false;
}

function sb_get_notes($conversation_id) {
    return sb_get_external_setting('notes-' . $conversation_id, []);
}

function sb_add_note($conversation_id, $user_id, $name, $message) {
    $notes = sb_get_notes($conversation_id);
    $id = rand(0, 99999);
    array_push($notes, ['id' => $id, 'user_id' => $user_id, 'name' => $name, 'message' => sb_sanatize_string($message)]);
    $response = sb_save_external_setting('notes-' . $conversation_id, $notes);
    return $response ? $id : $response;
}

function sb_update_note($conversation_id, $user_id, $note_id, $message) {
    $notes = sb_get_notes($conversation_id);
    for ($i = 0; $i < count($notes); $i++) {
        if ($notes[$i]['id'] == $note_id) {
            $notes[$i]['message'] = sb_sanatize_string($message);
            $notes[$i]['user_id'] = $user_id;
            return sb_save_external_setting('notes-' . $conversation_id, $notes);
        }
    }
    return false;
}

function sb_delete_note($conversation_id, $note_id) {
    $notes = sb_get_notes($conversation_id);
    for ($i = 0; $i < count($notes); $i++) {
        if ($notes[$i]['id'] == $note_id) {
            array_splice($notes, $i, 1);
            return count($notes) ? sb_save_external_setting('notes-' . $conversation_id, $notes) : sb_db_query('DELETE FROM sb_settings WHERE name = "notes-' . sb_db_escape($conversation_id) . '" LIMIT 1');
        }
    }
    return false;
}

function sb_direct_message($user_ids, $message) {
    $sources = ['whatsapp' => 'wa', 'messenger' => 'fb', 'telegram' => 'tg', 'viber' => 'vb', 'twitter' => 'tw', 'instagram' => 'ig', 'line' => 'ln', 'wechat' => 'wc', 'google' => 'bm', 'tickets' => 'tk'];
    if (is_string($user_ids) && ($user_ids == 'all' || isset($sources[$user_ids]))) {
        $items = sb_db_get($user_ids == 'all' ? 'SELECT id FROM sb_users WHERE user_type <> "agent" AND user_type <> "admin" AND user_type <> "bot"' : 'SELECT A.id FROM sb_users A, sb_conversations B WHERE B.source = "' . sb_db_escape($sources[$user_ids]) . '" AND B.user_id = A.id GROUP BY A.id', false);
        $user_ids = [];
        for ($i = 0; $i < count($items); $i++) {
            array_push($user_ids, $items[$i]['id']);
        }
    }
    $user_ids = is_string($user_ids) ? explode(',', str_replace(' ', '', $user_ids)) : $user_ids;
    $user_ids_string = substr(json_encode($user_ids), 1, -1);
    $missing = sb_db_get('SELECT id FROM sb_users WHERE id NOT IN (' . $user_ids_string . ') AND id NOT IN (SELECT user_id FROM sb_conversations)', false);
    if (!empty($missing)) {
        $query = 'INSERT INTO sb_conversations(user_id, title, status_code, creation_time) VALUES ';
        for ($i = 0; $i < count($missing); $i++) {
            $query .= '(' . $missing[$i]['id'] . ', "", 1, NOW()),';
        }
        sb_db_query(substr($query, 0, -1));
    }
    $conversations = sb_db_get('SELECT user_id, id FROM sb_conversations WHERE user_id IN (' . $user_ids_string . ') GROUP BY user_id', false);
    $query = 'INSERT INTO sb_messages(user_id, message, creation_time, status_code, attachments, payload, conversation_id) VALUES ';
    $active_user = sb_get_active_user();
    $active_user_id = $active_user['id'];
    $now = gmdate('Y-m-d H:i:s');
    $count = count($conversations);
    for ($i = 0; $i < $count; $i++) {
        $query .= '(' . $active_user_id . ', "' . sb_db_escape(sb_merge_fields($message, [sb_get_user($conversations[$i]['user_id'])])) . '", "' . $now . '", 0, "", "", ' . $conversations[$i]['id'] . '),';
    }
    $response = sb_db_query(substr($query, 0, -1));
    if (sb_is_error($response)) {
        return new SBValidationError($response);
    }

    // Pusher
    if (sb_pusher_active()) {
        $channels = [];
        for ($i = 0; $i < count($user_ids); $i++) {
            array_push($channels, 'private-user-' . $user_ids[$i]);
        }
        sb_pusher_trigger($channels, 'new-message');
        sb_update_users_last_activity($active_user_id);
    }

    // Push notifications
    if (sb_get_multi_setting('push-notifications', 'push-notifications-users-active')) {
        sb_push_notification(sb_get_user_name(), $message, $active_user['profile_image'], $user_ids);
    }

    // Messaging apps
    $conversations = sb_db_get('SELECT user_id, id, source, extra FROM sb_conversations WHERE source <> "" AND user_id IN (' . $user_ids_string . ')', false);
    for ($i = 0; $i < count($conversations); $i++) {
        sb_messaging_platforms_send_message($message, $conversations[$i]);
    }

    sb_reports_update('direct-messages', mb_substr($message, 0, 18) . ' | ' . $count);
    return $response;
}

function sb_get_agents_in_conversation($conversation_id) {
    $rows = sb_db_get('SELECT A.id, first_name, last_name, profile_image, B.conversation_id FROM sb_users A, sb_messages B WHERE (A.user_type = "agent" OR A.user_type = "admin") AND A.id = B.user_id AND conversation_id ' . (is_array($conversation_id) ? ('IN (' . sb_db_escape(implode(',', $conversation_id)) . ')') : ('= ' . sb_db_escape($conversation_id, true))) . (sb_is_agent() ? '' : ' AND conversation_id in (SELECT id FROM sb_conversations WHERE user_id = ' . sb_get_active_user_ID() . ')') . ' GROUP BY A.id, B.conversation_id', false);
    $response = [];
    for ($i = 0; $i < count($rows); $i++) {
        if (isset($response[$rows[$i]['conversation_id']]))
            array_push($response[$rows[$i]['conversation_id']], $rows[$i]);
        else
            $response[$rows[$i]['conversation_id']] = [$rows[$i]];
    }
    return $response;
}

function sb_conversation_security_error($conversation_id) {
    return !sb_is_agent() && empty($GLOBALS['SB_FORCE_ADMIN']) && sb_isset(sb_db_get('SELECT user_id FROM sb_conversations WHERE id = ' . $conversation_id), 'user_id') != sb_get_active_user_ID();
}

function sb_set_agent_active_conversation($conversation_id, $agent_id = false) {
    $agent_id = $agent_id ? $agent_id : sb_get_active_user_ID();
    $active_agents_conversations = sb_get_external_setting('active_agents_conversations', []);
    $previous_conversation_id = sb_isset($active_agents_conversations, $agent_id, [false]);
    $active_agents_conversations[$agent_id] = [$conversation_id, time()];
    sb_save_external_setting('active_agents_conversations', $active_agents_conversations);
    if (sb_pusher_active())
        sb_pusher_trigger('agents', 'agent-active-conversation-changed', ['agent_id' => $agent_id, 'previous_conversation_id' => $previous_conversation_id[0], 'conversation_id' => $conversation_id]);
}

function sb_is_active_conversation_busy($conversation_id, $skip = -1) {
    $items = sb_get_external_setting('active_agents_conversations', []);
    $time = time();
    if (empty($items)) {
        return false;
    }
    foreach ($items as $agent_id => $value) {
        if ($agent_id != $skip && $value[0] == $conversation_id && ($time - 3600) < $value[1] && sb_is_user_online($agent_id)) {
            return $agent_id;
        }
    }
    return false;
}

function sb_count_conversations($status_code = false) {
    return sb_isset(sb_db_get('SELECT COUNT(*) AS count FROM sb_conversations' . ($status_code ? ' WHERE status_code = ' . sb_db_escape($status_code) . sb_routing_and_department_db() : '')), 'count');
}

function sb_send_agents_notifications($message, $bottom_message = false, $conversation_id = false, $attachments = false, $user = false, $extra = false) {
    $user = $user ? $user : (sb_is_agent() ? sb_get_user_from_conversation($conversation_id) : sb_get_active_user());
    $user_name = sb_get_user_name($user);
    $recipients = 'agents';
    $is_online = false;
    $force = sb_isset($extra, 'force');
    if ($conversation_id) {
        $conversation = sb_db_get('SELECT agent_id, department FROM sb_conversations WHERE id = ' . sb_db_escape($conversation_id, true));
        if ($conversation['department']) {
            $recipients = 'department-' . $conversation['department'];
        } else if ($conversation['agent_id']) {
            $recipients = $conversation['agent_id'];
            $is_online = sb_get_setting('stop-notify-admins') && sb_is_agent(sb_get_user($recipients), true, true) ? true : sb_is_user_online($recipients);
        }
    }
    if (!$is_online) {
        if ($force || sb_get_setting('notify-agent-email')) {
            sb_email_create($recipients, $user_name, $user['profile_image'], (empty($extra['email']) ? $message : $extra['email']) . ($bottom_message ? ('<br><br><span style="color:#a8a8a8;font-size:12px;">' . $bottom_message . '</span>') : ''), $attachments, false, $conversation_id);
        }
        if ($force || sb_get_multi_setting('sms', 'sms-active-agents')) {
            sb_send_sms($message, $recipients, true, $conversation_id, $attachments);
        }
    }
    if ($force || sb_get_multi_setting('push-notifications', 'push-notifications-active')) {
        sb_push_notification($user_name, $message, $user['profile_image'], $recipients, $conversation_id, sb_isset($user, 'id'), $attachments);
    }
    if (sb_pusher_active()) {
        sb_pusher_trigger('agents', 'update-conversations', ['conversation_id' => $conversation_id]);
    }
    return true;
}

function sb_check_conversations_assignment($conversation_ids, $agent_id = false, $department = false) {
    if (empty($conversation_ids)) {
        return [];
    }
    $conversation_ids = sb_db_get('SELECT id FROM sb_conversations WHERE id IN (' . sb_db_escape(implode(',', $conversation_ids)) . ') AND ' . ($agent_id ? ('agent_id <> ' . sb_db_escape($agent_id, true)) : '') . ($agent_id && $department ? ' AND ' : '') . ($department ? ('department <> ' . sb_db_escape($department)) : ''), false);
    for ($i = 0; $i < count($conversation_ids); $i++) {
        $conversation_ids[$i] = $conversation_ids[$i]['id'];
    }
    return $conversation_ids;
}

function sb_get_last_agent_in_conversation($conversation_id) {
    $agent = sb_db_get('SELECT B.id, B.first_name, B.last_name, B.email, B.user_type, B.token, B.department  FROM sb_messages A, sb_users B WHERE A.conversation_id = ' . sb_db_escape($conversation_id, true) . ' AND A.user_id = B.id AND (B.user_type = "agent" OR B.user_type = "admin") ORDER BY A.id LIMIT 1');
    return isset($agent['id']) ? $agent : false;
}

function sb_get_last_message($conversation_id, $exclude_message = false, $user_id = false) {
    return sb_db_get('SELECT message, attachments, payload FROM sb_messages WHERE (message <> "" || attachments <> "")' . ($exclude_message ? (' AND message <> "' . sb_db_escape($exclude_message) . '"') : '') . ' AND conversation_id = ' . sb_db_escape($conversation_id, true) . ($user_id ? (' AND user_id = ' . sb_db_escape($user_id, true)) : '') . ' ORDER BY id DESC LIMIT 1');
}

function sb_delete_attachments($conversation_id = false, $message_id = false) {
    $attachments_all = sb_db_get('SELECT attachments FROM sb_messages WHERE ' . ($conversation_id ? 'conversation_id' : 'id') . ' = ' . sb_db_escape($conversation_id ? $conversation_id : $message_id, true), false);
    for ($i = 0; $i < count($attachments_all); $i++) {
        $attachments = sb_isset($attachments_all[$i], 'attachments');
        if ($attachments) {
            $attachments = json_decode($attachments, true);
            for ($j = 0; $j < count($attachments); $j++) {
                sb_file_delete($attachments[$j][1]);
            }
        }
    }
    return true;
}

function sb_update_messages_status($message_ids, $user_id = false) {
    $response = sb_db_query('UPDATE sb_messages SET status_code = 2 WHERE id IN (' . sb_db_escape(implode(',', $message_ids)) . ')');
    if ($user_id && sb_pusher_active()) {
        sb_pusher_trigger('private-user-' . $user_id, 'message-status-update', ['message_ids' => $message_ids]);
    }
    return $response;
}

/*
 * -----------------------------------------------------------
 * MESSAGES
 * -----------------------------------------------------------
 *
 * 1. Add a message to a conversation
 * 2. Update an existing message
 * 3. Delete a message
 * 4. Send the default close message
 * 5. Convert the merge fields to the final values
 * 6. Save a voice message
 *
 */

function sb_send_message($sender_id, $conversation_id, $message = '', $attachments = [], $conversation_status_code = -1, $payload = false, $queue = false, $recipient_id = false) {
    $pusher = sb_pusher_active();
    $conversation_id = sb_db_escape($conversation_id, true);
    $user_id = $sender_id;
    if (!$sender_id || $sender_id == -1) {
        $sender_id = sb_get_active_user_ID();
    } else {
        $sender_id = sb_db_escape($sender_id, true);
    }
    if ($sender_id) {
        $attachments_json = '';
        $security = sb_is_agent();
        $attachments = sb_json_array($attachments);
        $conversation = sb_db_get('SELECT status_code, agent_id, user_id, department, source FROM sb_conversations WHERE id = ' . $conversation_id);
        if (!$conversation || sb_is_error($conversation)) {
            return trigger_error('Conversation not found.');
        }
        $conversation_source = sb_isset($conversation, 'source');
        $sender = sb_get_user($sender_id);
        $user = sb_db_get('SELECT * FROM sb_users WHERE id = ' . $conversation['user_id']);
        $user_id = $user['id'];
        $is_sender_agent = sb_is_agent($sender);
        $is_sender_bot = sb_isset($sender, 'user_type') == 'bot';
        $is_chatbot_active = sb_chatbot_active();
        $is_human_takeover_active = $is_chatbot_active && sb_dialogflow_is_human_takeover($conversation_id);
        $is_human_takeover = $is_chatbot_active && !$is_human_takeover_active && sb_get_multi_setting('dialogflow-human-takeover', 'dialogflow-human-takeover-active');
        $last_agent = false;
        if (!$message && !empty($attachments) && strpos($attachments[0][0], 'voice_message') && defined('SB_DIALOGFLOW') && !sb_chatbot_active() && sb_get_multi_setting('open-ai', 'open-ai-speech-recognition')) {
            $message = sb_open_ai_audio_to_text($attachments[0][1], false, $sender_id);
        }
        if ($is_sender_agent && !$is_sender_bot) {
            if ($is_chatbot_active && !$is_human_takeover_active) {
                sb_send_message(sb_get_bot_id(), $conversation_id, '', [], false, ['human-takeover' => true]);
                $GLOBALS['human-takeover-' . $conversation_id] = true;
                $is_human_takeover_active = true;
                $is_human_takeover = false;
            }
            if (sb_get_multi_setting('open-ai', 'open-ai-spelling-correction')) {
                $message = sb_open_ai_spelling_correction($message);
            }
        }
        if (count($attachments) > 0) {
            $attachments_json = '[';
            for ($i = 0; $i < count($attachments); $i++) {
                $attachments_json .= '[\"' . sb_db_escape($attachments[$i][0]) . '\", \"' . sb_db_escape($attachments[$i][1]) . '\"' . (isset($attachments[$i][2]) ? ', \"' . $attachments[$i][2] . '\"' : '') . '],';
            }
            $attachments_json = substr($attachments_json, 0, -1) . ']';
        }
        if ($security || $user_id == sb_get_active_user_ID() || !empty($GLOBALS['SB_FORCE_ADMIN'])) {

            // Message sending
            if ($recipient_id) {
                global $SB_LANGUAGE;
                $SB_LANGUAGE = [sb_get_user_language($recipient_id), 'front'];
            }
            if (!$pusher) {
                sb_set_typing($sender_id, -1);
            }
            if ($payload !== false) {
                $payload = sb_json_array($payload);
            }
            $message = sb_merge_fields($message, [$user]);
            if (sb_is_cloud() && in_array(sb_defined('SB_CLOUD_MEMBERSHIP_TYPE', 'messages'), ['messages', 'messages-agents'])) {
                sb_cloud_increase_count();
            }
            $message = preg_replace("/(\n){3,}/", "\n\n", str_replace(["\r", "\t"], "\n", $message));
            $response = sb_db_query('INSERT INTO sb_messages(user_id, message, creation_time, status_code, attachments, payload, conversation_id) VALUES ("' . $sender_id . '", "' . sb_db_escape($message) . '", "' . gmdate('Y-m-d H:i:s') . '", 0, "' . $attachments_json . '", "' . ($payload ? sb_db_json_escape($payload) : '') . '", "' . $conversation_id . '")', true);

            if (!sb_is_agent()) {

                // Queue
                if ($queue) {
                    if ($conversation['status_code'] == 3) {
                        sb_routing_assign_conversation(null, $conversation_id);
                        $conversation['agent_id'] = '';
                    } else {
                        $queue = false;
                    }
                } else if ($conversation['status_code'] == 3 && (sb_get_setting('routing') || sb_get_multi_setting('agent-hide-conversations', 'agent-hide-conversations-active'))) {

                    // Routing change agent if offline
                    $last_agent = sb_get_last_agent_in_conversation($conversation_id);
                    if ($last_agent && !sb_is_user_online($last_agent['id'])) {
                        sb_update_conversation_agent($conversation_id, sb_get_setting('routing') ? 'routing' : 'routing-unassigned');
                    }
                }
            }

            // Conversation status code
            if ($conversation_status_code != 'skip') {
                if ($conversation_status_code == -1 || $conversation_status_code === false || !in_array($conversation_status_code, [0, 1, 2, 3, 4])) {
                    $conversation_status_code = $is_sender_agent && !$is_sender_bot ? 1 : ($is_human_takeover ? 1 : 2);
                }
                if ($conversation_status_code != $conversation['status_code']) {
                    sb_db_query('UPDATE sb_conversations SET status_code = ' . sb_db_escape($conversation_status_code) . ' WHERE id = ' . $conversation_id);
                    sb_webhooks('SBActiveConversationStatusUpdated', ['conversation_id' => $conversation_id, 'status_code' => $conversation_status_code]);
                }
            }

            if (sb_is_error($response)) {
                return $response;
            }
            if ($pusher) {
                $payload = ['conversation_user_id' => $user_id, 'message_id' => $response, 'conversation_id' => $conversation_id];
                sb_pusher_trigger('private-user-' . $user_id, 'new-message', $payload);
                sb_pusher_trigger('agents', 'update-conversations', $payload);
                sb_update_users_last_activity($sender_id);
            }

            // Notifications
            $response_notifications = [];
            $recipient_id = false;
            $queue_active = empty($conversation['agent_id']) && !$is_sender_agent && sb_get_multi_setting('queue', 'queue-active');
            $user_name = sb_get_user_name($sender);
            if ($is_sender_agent) {
                $recipient_id = $user_id;
            } else {
                $last_agent = $last_agent ? $last_agent : sb_get_last_agent_in_conversation($conversation_id);
                if ($last_agent) {
                    $recipient_id = $last_agent['id'];
                } else if (!empty($conversation['agent_id'])) {
                    $recipient_id = $conversation['agent_id'];
                } else if (!empty($conversation['department'])) {
                    $recipient_id = 'department-' . $conversation['department'];
                } else {
                    $recipient_id = 'agents';
                }
                if (!empty($user['email']) && defined('SB_TICKETS')) {
                    $channel = sb_get_setting('tickets-email-notification');
                    if (($channel && ($channel == 'all' || (!$conversation_source && $channel == 'c') || $channel == $conversation_source || ($channel == 'em-tk' && in_array($conversation_source, ['tk', 'em'])))) && sb_db_get('SELECT COUNT(*) AS `count` FROM sb_messages WHERE conversation_id = "' . $conversation_id . '" LIMIT 1')['count'] == 1) {
                        sb_tickets_email($user, $message, $attachments, $conversation_id);
                    }
                }
            }
            if (!$queue_active && !$is_human_takeover && ((!$is_sender_agent && sb_get_multi_setting('push-notifications', 'push-notifications-active')) || ($is_sender_agent && sb_get_multi_setting('push-notifications', 'push-notifications-users-active')))) {
                sb_push_notification($user_name, $message, $sender['profile_image'], $recipient_id, $conversation_id, $user_id, $attachments);
            }
            if ((!$queue_active || (!$is_sender_agent && !sb_agents_online())) && !$is_sender_bot && !$is_human_takeover) {
                $user_check = $is_sender_agent && (!sb_is_user_online($user_id) || $conversation_source == 'em');
                $agent_check = !$is_sender_agent && (!is_numeric($recipient_id) || !sb_is_user_online($recipient_id));
                if (($agent_check && sb_get_multi_setting('sms', 'sms-active-agents')) || ($user_check && sb_get_multi_setting('sms', 'sms-active-users') && !in_array($conversation['source'], ['wa', 'tg']))) {
                    $response_notification = sb_send_sms($message, $recipient_id, true, $conversation_id, $attachments);
                    if ($response_notification) {
                        array_push($response_notifications, 'sms');
                    }
                }
                if (($agent_check && sb_get_setting('notify-agent-email')) || (!empty($user['email']) && ($user_check && (sb_get_setting('notify-user-email') || $conversation['source'] == 'em')))) {
                    if (sb_get_setting('notify-email-cron')) {
                        $cron_job_emails = sb_get_external_setting('cron-email-notifications', []);
                        if (!isset($cron_job_emails[$conversation_id])) {
                            $cron_job_emails[$conversation_id] = [$recipient_id, $user_name, $sender['profile_image'], $attachments, sb_isset($conversation, 'department'), !$is_sender_agent];
                            sb_save_external_setting('cron-email-notifications', $cron_job_emails);
                        }
                        array_push($response_notifications, 'email-cron');
                    } else {
                        $continue = !$agent_check;
                        if (!$continue) {
                            $previous_human_message_user_type = sb_db_get('SELECT A.user_type, B.creation_time FROM sb_users A, sb_messages B WHERE B.conversation_id = ' . $conversation_id . ' AND B.id <> ' . $response . ' AND B.user_id = A.id AND (A.user_type = "agent" OR A.user_type = "admin" OR A.id = ' . $user_id . ') ORDER BY B.id DESC LIMIT 1');
                            $continue = !$previous_human_message_user_type || sb_is_agent($previous_human_message_user_type['user_type']) || sb_get_timestamp($previous_human_message_user_type['creation_time']) < (time() - 120);
                        }
                        if ($continue) {
                            $response_notification = sb_email_create($recipient_id, $user_name, $sender['profile_image'], $message, $attachments, sb_isset($conversation, 'department'), $conversation_id);
                            if ($response_notification) {
                                array_push($response_notifications, 'email');
                            }
                        }
                    }
                }
            }
            if ($is_sender_agent && sb_get_setting('logs')) {
                sb_logs('sent the message #' . $response . ' in the conversation #' . $conversation_id, $sender);
            }
            sb_webhooks('SBMessageSent', ['user_id' => $sender_id, 'message_id' => $response, 'message' => $message, 'attachments' => $attachments, 'conversation_user_id' => $user_id, 'conversation_id' => $conversation_id, 'conversation_status_code' => $conversation_status_code, 'conversation_source' => $conversation['source']]);
            return ['id' => $response, 'queue' => $queue, 'human_takeover_active' => $is_human_takeover_active, 'notifications' => $response_notifications, 'message' => $message];
        }
        return sb_error('security-error', 'sb_send_message');
    } else {
        return sb_error('active-user-not-found', 'sb_send_message');
    }
}

function sb_update_message($message_id, $message = false, $attachments = false, $payload = false) {
    return sb_update_or_delete_message('update', $message_id, $message, $attachments, $payload);
}

function sb_delete_message($message_id) {
    return sb_update_or_delete_message('delete', $message_id);
}

function sb_update_or_delete_message($action, $message_id, $message = false, $attachments = false, $payload = false) {
    $pusher = sb_pusher_active();
    $security = sb_is_agent() || !empty($GLOBALS['SB_FORCE_ADMIN']);
    $conversation = false;
    $user_id = false;
    $response = false;
    $message_id = sb_db_escape($message_id, true);
    if (!$security || $pusher) {
        $conversation = sb_db_get('SELECT id, user_id FROM sb_conversations WHERE id = (SELECT conversation_id FROM sb_messages WHERE id = ' . $message_id . ')');
        $user_id = sb_isset($conversation, 'user_id');
        if ($user_id == sb_get_active_user_ID()) {
            $security = true;
        }
    }
    if ($security) {
        if ($action == 'update') {
            if ($message === false && $payload === false && $attachments === false) {
                return new SBValidationError('missing-arguments');
            }
            if ($attachments !== false) {
                $attachments = sb_json_array($attachments, false);
            }
            if ($payload !== false) {
                $payload = sb_json_array($payload, false);
            }
            $response = sb_db_query('UPDATE sb_messages SET ' . ($message !== false ? 'message = "' . sb_db_escape($message) . '",' : '') . ' creation_time = "' . gmdate('Y-m-d H:i:s') . '"' . ($payload !== false ? ', payload = "' . sb_db_json_escape($payload) . '"' : '') . ($attachments !== false ? ', attachments = "' . sb_db_json_escape($attachments) . '"' : '') . ' WHERE id = ' . $message_id);
        }
        if ($action == 'delete') {
            sb_delete_attachments(false, $message_id);
            $response = sb_db_query('DELETE FROM sb_messages WHERE id = ' . $message_id);
        }
        if (sb_is_agent() && sb_get_setting('logs')) {
            sb_logs($action . 'd the message #' . $message_id);
        }
        if ($response && $pusher) {
            $payload = ['conversation_user_id' => $user_id, 'message_id' => $message_id, 'conversation_id' => sb_isset($conversation, 'id')];
            sb_pusher_trigger('private-user-' . $user_id, 'new-message', $payload);
            sb_pusher_trigger('agents', 'update-conversations', $payload);
        }
        return $response;
    }
    return sb_error('security-error', 'sb_' . $action . '_message');
}

function sb_close_message($conversation_id, $bot_id = false) {
    $message = sb_get_multi_setting('close-message', 'close-msg');
    if ($message) {
        if (!$bot_id) {
            $bot_id = sb_get_bot_id();
        }
        $message_id = sb_send_message($bot_id, $conversation_id, $message, [], 3, ['type' => 'close-message'])['id'];
        return sb_messaging_platforms_send_message($message, $conversation_id, $message_id);
    }
    return false;
}

function sb_merge_fields($message, $marge_fields_values = []) {
    $replace = '';
    $marge_fields = ['user_name', 'user_email', 'agent_name', 'agent_email'];
    $marge_field = '';
    if (defined('SB_WOOCOMMERCE')) {
        $message = sb_woocommerce_merge_fields($message, $marge_fields_values);
    }
    for ($i = 0; $i < count($marge_fields); $i++) {
        if (strpos($message, '{' . $marge_fields[$i]) !== false) {
            $marge_field = '{' . $marge_fields[$i] . '}';
            $value = isset($marge_fields_values[$i]) ? $marge_fields_values[$i] : false;
            switch ($marge_fields[$i]) {
                case 'user_name':
                    $replace = sb_get_user_name($value);
                    break;
                case 'user_email':
                    $replace = $value ? $value : sb_isset(sb_get_active_user(), 'email', '{user_email}');
                    break;
                case 'agent_name':
                    $replace = sb_is_agent() ? sb_get_user_name() : '';
                    break;
                case 'agent_email':
                    $replace = sb_is_agent() ? sb_isset(sb_get_active_user(), 'email', '') : '';
                    break;
            }
        }
        $message = str_replace($marge_field, $replace, $message);
    }
    return $message;
}

function sb_tags_update($conversation_id, $tags, $add = false) {
    if (sb_conversation_security_error($conversation_id)) {
        return sb_error('security-error', 'sb_tags_update');
    }
    for ($i = 0; $i < count($tags); $i++) {
        $tags[$i] = trim(str_replace(',', '', $tags[$i]));
    }
    if ($add) {
        $existing_tags = sb_isset(sb_db_get('SELECT tags FROM sb_conversations WHERE id = ' . sb_db_escape($conversation_id, true)), 'tags');
        if ($existing_tags) {
            $existing_tags = explode(',', $existing_tags);
            for ($i = 0; $i < count($existing_tags); $i++) {
                if (!in_array($existing_tags[$i], $tags)) {
                    array_push($tags, $existing_tags[$i]);
                }
            }
        }
    }
    $response = sb_db_query('UPDATE sb_conversations SET tags = "' . sb_db_escape(implode(',', $tags)) . '" WHERE id = ' . sb_db_escape($conversation_id, true));
    $all_tags = sb_db_get('SELECT tags FROM sb_conversations WHERE tags IS NOT NULL AND tags <> ""', false);
    $all_tags_final = [];
    for ($i = 0; $i < count($all_tags); $i++) {
        $tags = explode(',', $all_tags[$i]['tags']);
        for ($j = 0; $j < count($tags); $j++) {
            if (!in_array($tags[$j], $all_tags_final)) {
                array_push($all_tags_final, $tags[$j]);
            }
        }
    }
    sb_save_external_setting('tags', $all_tags_final);
    return [$response, $all_tags_final];
}

function sb_audio_clip($audio) {
    $file_name = '/audio-' . rand(1000000, 999999999) . '.webm';
    $path = sb_upload_path(false, true) . $file_name;
    $url = false;
    sb_file($path, $audio);
    if (sb_get_multi_setting('amazon-s3', 'amazon-s3-active') || defined('SB_CLOUD_AWS_S3')) {
        $url_aws = sb_aws_s3($path);
        if (strpos($url_aws, 'http') === 0) {
            $url = $url_aws;
            unlink($path);
        } else {
            $url = sb_upload_path(true, true) . $file_name;
        }
    }
    return $url;
}

/*
 * -----------------------------------------------------------
 * RICH MESSAGES
 * -----------------------------------------------------------
 *
 * 1. Get the custom rich messages ids including the built in ones
 * 2. Get the rich message with the given name
 * 3. Escape a rich message shortcode value
 * 4. Return the full shortcode and its parameters
 * 5. Execute a bot message
 *
 */

function sb_get_rich_messages_ids() {
    $result = sb_get_external_setting('rich-messages');
    $ids = ['email', 'registration', 'login', 'timetable', 'articles'];
    if (is_array($result) && isset($result['rich-messages']) && is_array($result['rich-messages'][0])) {
        for ($i = 0; $i < count($result['rich-messages'][0]); $i++) {
            array_push($ids, $result['rich-messages'][0][$i]['rich-message-name']);
        }
        return $ids;
    }
    if (defined('SB_WOOCOMMERCE')) {
        $ids = array_merge($ids, ['woocommerce-cart']);
    }
    return $ids;
}

function sb_get_rich_message($name, $settings = false) {
    if (in_array($name, ['registration', 'registration-tickets', 'login', 'login-tickets', 'timetable', 'articles', 'woocommerce-cart'])) {
        $title = '';
        $message = '';
        $success = '';
        switch ($name) {
            case 'registration-tickets':
            case 'registration':
                $registration_tickets = $name == 'registration-tickets';
                $active_user = sb_get_active_user();
                $last_name = sb_get_setting('registration-last-name');
                $default = ['profile_image' => '', 'first_name' => '', 'last_name' => '', 'email' => '', 'password' => '', 'user_type' => 'visitor', 'details' => []];
                $user = $active_user && !sb_is_agent($active_user['user_type']) ? sb_get_user($active_user['id'], true) : $default;
                if (!$user) {
                    $user = $default;
                }
                $visitor = $user['user_type'] == 'visitor' || $user['user_type'] == 'lead';
                $settings = sb_get_setting('registration');
                $registration_fields = sb_get_setting('registration-fields');
                $title = sb_(sb_isset($settings, 'registration-title', 'Create new account'));
                $message = sb_(sb_isset($settings, 'registration-msg', ''));
                $success = sb_(sb_isset($settings, 'registration-success', ''));
                $profile_image = sb_get_setting('registration-profile-img') ? '<div id="profile_image" data-type="image" class="sb-input sb-input-image sb-profile-image"><span>' . sb_('Profile image') . '</span><div' . ($user['profile_image'] && strpos($user['profile_image'], 'media/user.svg') == false ? ' data-value="' . $user['profile_image'] . '" style="background-image:url(\'' . $user['profile_image'] . '\')"' : '') . ' class="image">' . ($user['profile_image'] && strpos($user['profile_image'], 'media/user.svg') == false ? '<i class="sb-icon-close"></i>' : '') . '</div></div>' : '';
                $password = (!$registration_tickets && sb_get_setting('registration-password')) || ($registration_tickets && !sb_get_setting('tickets-registration-disable-password')) ? '<div id="password" data-type="text" class="sb-input sb-input-password"><span>' . sb_('Password') . '</span><input value="' . ($user && $user['password'] ? '********' : '') . '" autocomplete="false" type="password" required></div><div id="password-check" data-type="text" class="sb-input sb-input-password"><span>' . sb_('Repeat password') . '</span><input value="' . ($user && $user['password'] ? '********' : '') . '" autocomplete="false" type="password" required></div>' : '';
                $link = $settings['registration-terms-link'] || $settings['registration-privacy-link'] ? '<div class="sb-link-area">' . sb_('By clicking the button below, you agree to our') . ' <a target="_blank" href="' . sb_isset($settings, 'registration-terms-link', $settings['registration-privacy-link']) . '">' . sb_($settings['registration-terms-link'] ? 'Terms of service' : 'Privacy Policy') . '</a>' . ($settings['registration-privacy-link'] && $settings['registration-terms-link'] ? ' ' . sb_('and') . ' <a target="_blank" href="' . $settings['registration-privacy-link'] . '">' . sb_('Privacy Policy') . '</a>' : '') . '.</div>' : '';
                $email = sb_get_setting('registration-email-disable') ? '' : '<div id="email" data-type="text" class="sb-input sb-input-text"><span>' . sb_('Email') . '</span><input value="' . $user['email'] . '" autocomplete="off" type="email" required></div>';
                $code = '<div class="sb-form-main sb-form">' . $profile_image . '<div id="first_name" data-type="text" class="sb-input sb-input-text"><span>' . sb_($last_name ? 'First name' : 'Name') . '</span><input value="' . ($visitor ? '' : $user['first_name']) . '" autocomplete="false" type="text" required></div>' . ($last_name ? '<div id="last_name" data-type="text" class="sb-input sb-input-text"><span>' . sb_('Last name') . '</span><input value="' . ($visitor ? '' : $user['last_name']) . '" autocomplete="false" type="text" required></div>' : '') . $email . $password . '</div><div class="sb-form-extra sb-form">';
                $extra = [];
                if (isset($user['details'])) {
                    for ($i = 0; $i < count($user['details']); $i++) {
                        $extra[$user['details'][$i]['slug']] = $user['details'][$i]['value'];
                    }
                }
                if (sb_get_multi_setting('envato-validation', 'envato-validation-active')) {
                    $registration_fields['envato-purchase-code'] = true;
                }
                foreach ($registration_fields as $key => $value) {
                    if ($value) {
                        $key = str_replace('reg-', '', $key);
                        $name = str_replace('-', ' ', $key);
                        $filled = (isset($extra[$name]) ? ' value="' . $extra[$name] . '"' : '');
                        $type = $type_cnt = 'text';
                        $custom_input = false;
                        $required = '';
                        switch ($key) {
                            case 'envato-purchase-code':
                                $required = ' required';
                                break;
                            case 'birthday':
                                $type = 'date';
                                break;
                            case 'twitter':
                            case 'linkedin':
                            case 'facebook':
                            case 'pinterest':
                            case 'instagram':
                            case 'website':
                                $type = 'url';
                                break;
                            case 'phone':
                                $type_cnt = 'select-input';
                                $custom_input = '<div class="sb-select-phone' . (sb_get_setting('phone-code') ? ' sb-single-prefix' : '') . '">' . sb_select_phone() . '</div><input' . $filled . ' autocomplete="false" type="number"' . (sb_get_setting('registration-phone-required') ? ' required' : '') . '>';
                                break;
                            case 'country':
                                $type_cnt = 'select';
                                $custom_input = sb_select_countries();
                                break;
                            case 'language':
                                $type_cnt = 'select';
                                $custom_input = sb_select_languages();
                                break;
                        }
                        $code .= '<div id="' . $key . '" data-type="' . $type_cnt . '" class="sb-input sb-input-' . $type_cnt . '"><span>' . sb_(ucfirst($name)) . '</span>' . ($custom_input ? $custom_input : '<input' . $filled . ' autocomplete="false" type="' . $type . '"' . $required . '>') . '</div>';
                    }
                }
                if (sb_get_setting('registration-extra')) {
                    $additional_fields = sb_get_setting('user-additional-fields');
                    if ($additional_fields) {
                        for ($i = 0; $i < count($additional_fields); $i++) {
                            $value = $additional_fields[$i];
                            $name = $value['extra-field-name'];
                            $filled = isset($extra[$value['extra-field-slug']]) ? ' value="' . $extra[$value['extra-field-slug']] . '"' : '';
                            if ($name) {
                                $code .= '<div id="' . $value['extra-field-slug'] . '" data-type="text" class="sb-input sb-input-text"><span>' . sb_(ucfirst($name)) . '</span><input' . $filled . ' autocomplete="false" type="text"></div>';
                            }
                        }
                    }
                }
                $code .= '</div>' . $link . '<div class="sb-buttons"><div class="sb-btn sb-submit">' . sb_($visitor ? sb_isset($settings, 'registration-btn-text', 'Create account') : 'Update account') . '</div>' . ($password ? '<div class="sb-btn-text sb-login-area">' . sb_('Sign in instead') . '</div>' : '') . '</div>';
                break;
            case 'login-tickets':
            case 'login':
                $settings = sb_get_setting('login');
                $title = sb_(sb_isset($settings, 'login-title', 'Login'));
                $message = sb_($settings['login-msg']);
                $code = '<div class="sb-form"><div id="email" class="sb-input"><span>' . sb_('Email') . '</span><input autocomplete="false" type="email"></div><div id="password" class="sb-input"><span>' . sb_('Password') . '</span><input autocomplete="false" type="password"></div></div><div class="sb-buttons"><div class="sb-btn sb-submit-login">' . sb_('Sign in') . '</div>' . (sb_get_setting('registration-required') == 'login' ? '' : '<div class="sb-btn-text sb-registration-area">' . sb_('Create new account') . '</div>') . '</div>';
                break;
            case 'timetable':
                $settings = sb_get_settings();
                $timetable = sb_isset($settings, 'timetable', [false])[0];
                $title = $settings['chat-timetable'][0]['chat-timetable-title'][0];
                $message = $settings['chat-timetable'][0]['chat-timetable-msg'][0];
                $title = sb_t($title ? $title : 'Office hours');
                $message = sb_t($message);
                $code = '<div class="sb-timetable" data-offset="' . sb_get_setting('timetable-utc') . '">';
                if ($timetable) {
                    foreach ($timetable as $day => $hours) {
                        if ($hours[0][0]) {
                            $code .= '<div><div>' . sb_(ucfirst($day)) . '</div><div data-time="' . $hours[0][0] . '|' . $hours[1][0] . '|' . $hours[2][0] . '|' . $hours[3][0] . '"></div></div>';
                        }
                    }
                }
                $code .= '<span></span></div>';
                break;
            case 'articles':
                $articles_title = sb_get_setting('articles-title');
                $articles_button_link = sb_get_setting('articles-button-link');
                $code = '<div class="sb-dashboard-articles"><div class="sb-title">' . sb_t($articles_title ? $articles_title : 'Help Center') . '</div><div class="sb-input sb-input-btn"><input placeholder="' . sb_('Search for articles...') . '" autocomplete="off"><div class="sb-submit-articles sb-icon-search"></div></div><div class="sb-articles">';
                $articles = sb_get_articles(false, 2, false, false, sb_get_user_language());
                for ($i = 0; $i < count($articles); $i++) {
                    if (!empty($articles[$i])) {
                        $code .= '<div data-id="' . $articles[$i]['id'] . '"><div>' . $articles[$i]['title'] . '</div><span>' . $articles[$i]['content'] . '</span></div>';
                    }
                }
                $code .= '</div><div class="sb-btn sb-btn-all-articles"' . ($articles_button_link ? ' onclick="document.location.href = \'' . $articles_button_link . '\'"' : '') . '>' . sb_('All articles') . '</div></div>';
                break;
            case 'woocommerce-cart':
                $code = sb_woocommerce_rich_messages($name);
                break;
        }
        return ($title ? '<div class="sb-top">' . $title . '</div>' : '') . ($message ? '<div class="sb-text">' . $message . '</div>' : '') . $code . '<div data-success="' . $success . '" class="sb-info"></div>';
    } else {
        $result = sb_get_external_setting('rich-messages');
        if (is_array($result)) {
            $rich_messages = sb_isset($result, 'rich-messages')[0];
            if (is_array($rich_messages)) {
                for ($i = 0; $i < count($rich_messages); $i++) {
                    $item = $result['rich-messages'][0][$i];
                    if ($item['rich-message-name'] == $name) {
                        return $item['rich-message-content'];
                    }
                }
            }
        }
    }
    return false;
}

function sb_rich_value($value, $merge_fields = true, $translate = true, $shortcodes = false) {
    if ($translate) {
        $value = sb_t($value);
    }
    if (!$shortcodes) {
        $value = str_replace('"', '\'', strip_tags($value));
        $value = str_replace(['[', ']'], '', $value);
        $value = str_replace([PHP_EOL, "\r", "\n"], "\n", $value);
    }
    return trim($merge_fields ? sb_merge_fields($value) : $value);
}

function sb_get_shortcode($message, $name = false, $merge_field = false) {
    $separator = $merge_field ? ['{', '}'] : ['[', ']'];
    $response = false;
    $position = false;
    if (!is_string($message) || strpos($message, $separator[0]) === false) {
        return false;
    }
    if (!$name) {
        $shortcode_names = $merge_field ? [] : ['chips', 'buttons', 'select', 'inputs', 'card', 'slider-images', 'slider', 'list-image', 'list', 'button', 'video', 'image', 'rating', 'email', 'phone', 'registration', 'timetable', 'articles', 'table', 'share'];
        for ($i = 0; $i < count($shortcode_names); $i++) {
            $position = strpos($message, $separator[0] . $shortcode_names[$i]);
            if ($position !== false) {
                $name = $shortcode_names[$i];
                break;
            }
        }
        if (!$name) {
            return false;
        }
    }
    $position = $position ? $position : strpos($message, $separator[0] . $name);
    if ($position !== false) {
        $code = substr($message, $position);
        $code = substr($code, 0, strpos($code, $separator[1]) + 1);
        $response = ['shortcode' => $code, 'shortcode_name' => $name];
        $values = [];
        if (preg_match_all('/([\w-]+)\s*=\s*"([^"]*)"(?:\s|$)|([\w-]+)\s*=\s*\'([^\']*)\'(?:\s|$)|([\w-]+)\s*=\s*([^\s\'"]+)(?:\s|$)|"([^"]*)"(?:\s|$)|\'([^\']*)\'(?:\s|$)|(\S+)(?:\s|$)/', substr($code, 1, -1), $values, PREG_SET_ORDER)) {
            for ($i = 0; $i < count($values); $i++) {
                if (count($values[$i]) == 3 && !empty($values[$i][1]) && !empty($values[$i][2])) {
                    $response[$values[$i][1]] = $values[$i][2] === 'false' ? false : ($values[$i][2] === 'true' ? true : $values[$i][2]);
                }
            }
        }
    }
    return $response;
}

function sb_execute_bot_message($name, $conversation_id, $last_user_message = false, $check = true) {
    $valid = false;
    $settings = false;
    $message = '';
    $is_check = $conversation_id == 'check';
    $delay = false;
    if (!$is_check && sb_conversation_security_error($conversation_id)) {
        return sb_error('security-error', 'sb_execute_bot_message');
    }
    switch ($name) {
        case 'offline':
            $settings = sb_get_setting('chat-timetable');
            $valid = $settings['chat-timetable-active'] && (!sb_office_hours() || (!$settings['chat-timetable-agents'] && !sb_agents_online()));
            break;
        case 'follow_up':
            $settings = sb_get_block_setting('follow');
            $valid = $settings;
            break;
        case 'subscribe':
            $settings = sb_get_setting('subscribe-message');
            $valid = $settings['subscribe-active'];
            break;
    }
    if ($is_check) {
        return $valid;
    }
    if ($valid && (!$check || ($conversation_id && $name == 'offline') || sb_db_get('SELECT COUNT(*) AS `count` FROM sb_messages WHERE payload LIKE "{\"' . $name . '_message%" AND creation_time > "' . gmdate('Y-m-d H:i:s', time() - 864000) . '" AND conversation_id = ' . sb_db_escape($conversation_id, true))['count'] == 0)) {
        switch ($name) {
            case 'offline':
                $message = sb_get_multi_setting('chat-timetable', 'chat-timetable-title');
                $message = ($message ? '*' . sb_($message) . '*' . PHP_EOL : '') . sb_(sb_get_multi_setting('chat-timetable', 'chat-timetable-msg'));
                if ($conversation_id) {
                    $messages = sb_isset(sb_get_conversation(false, $conversation_id), 'messages');
                    $count = $messages ? count($messages) - 1 : 0;
                    for ($i = $count; $i > -1; $i--) {
                        if ($messages[$i]['user_type'] == 'agent' || $messages[$i]['user_type'] == 'admin' || $messages[$i]['message'] == $message) {
                            if ($messages[$i]['message'] == $message) {
                                return false;
                            }
                            break;
                        }
                    }
                }
                break;
            case 'follow_up':
                $message = '[email id="sb-follow-up" title="' . sb_rich_value($settings['title']) . '" message="' . sb_rich_value($settings['message']) . '" placeholder="' . sb_rich_value($settings['placeholder']) . '" name="' . $settings['name'] . '" last-name="' . $settings['last-name'] . '" phone="' . $settings['phone'] . '" phone-required="' . $settings['phone-required'] . '" success="' . sb_rich_value($settings['success']) . '"]';
                $delay = $settings['delay'];
                break;
            case 'subscribe':
                $message = '[email id="sb-subscribe-form" title="' . sb_rich_value($settings['subscribe-title']) . '" message="' . sb_rich_value($settings['subscribe-msg']) . '" success="' . sb_rich_value($settings['subscribe-msg-success']) . '" placeholder="' . sb_rich_value(sb_isset($settings, 'subscribe-placeholder', 'Email'), false) . '" name="' . ($settings['subscribe-name'] ? 'true' : 'false') . '" last-name="' . ($settings['subscribe-last-name'] ? 'true' : 'false') . '"]';
                break;
        }
        if ($delay) {
            sleep(intval($delay) / 1000);
        }
        $message_id = sb_send_message(sb_get_bot_id(), $conversation_id, $message, [], false, [$name . '_message' => true, 'preview' => $last_user_message ? $last_user_message : $message])['id'];
        return ['message' => $message, 'attachments' => [], 'id' => $message_id, 'settings' => $settings];
    }
    return false;
}

/*
 * -----------------------------------------------------------
 * MESSAGING PLATFORMS
 * -----------------------------------------------------------
 *
 * 1. Manage the messaging platforms features
 * 2. Send messages to the messaging platforms
 * 3. Send a text message
 *
 */

function sb_messaging_platforms_functions($conversation_id, $message, $attachments, $user, $source) {
    if (is_numeric($user)) {
        $user = sb_get_user($user);
        if (!$user) {
            return sb_error('user-not-found', 'sb_messaging_platforms_functions');
        }
    }
    if (is_string($source)) {
        $source = ['source' => $source];
    }
    if (!$attachments) {
        $attachments = [];
    }
    $last_message = sb_db_get('SELECT message FROM sb_messages WHERE message <> "" AND message <> "' . sb_db_escape($message) . '" AND conversation_id = ' . $conversation_id . ' ORDER BY id DESC LIMIT 1');
    $user_id = $user['id'];
    $source_name = $source['source'];
    $bot_messages = true;
    $human_takeover = false;
    $skip_chatbot = false;
    $slack = defined('SB_SLACK') && sb_slack_can_send($conversation_id) ? [$user['id'], sb_get_user_name($user), $user['profile_image']] : false;
    $dialogflow_active = sb_chatbot_active(true, false);
    $open_ai_active = sb_chatbot_active(false, true);
    $message_id = false;
    $source['user_id'] = $user_id;
    $source['id'] = $conversation_id;

    // Rich messages
    if ($last_message) {
        $last_message = $last_message['message'];
        $shortcode = sb_get_shortcode($last_message);
        if ($shortcode) {
            switch ($shortcode['shortcode_name']) {
                case 'phone':
                case 'email':
                    if (!in_array($source_name, ['em', 'tm'])) {
                        $valid = false;
                        $is_email = $shortcode['shortcode_name'] == 'email';
                        $filter = $is_email ? ['@', 'email'] : (strpos($message, '+') !== false ? ['+', 'phone'] : false);
                        if ($filter) {
                            $words = explode(' ', $message);
                            for ($i = 0; $i < count($words); $i++) {
                                if (strpos($words[$i], $filter[0]) !== false) {
                                    $value = trim($words[$i]);
                                    if (substr($value, -1) == '.')
                                        $value = substr($value, 0, -1);
                                    if (strlen($value) > 3 && (($is_email && strpos($value, '.')) || (!$is_email && is_numeric(substr($value, 1))))) {
                                        sb_update_user_value($user_id, $filter[1], $value);
                                        if (!empty($shortcode['success'])) {
                                            if ($is_email && !empty($shortcode['phone']) && $source_name != 'wa' && !sb_get_user_extra($user_id, 'phone')) {
                                                $message_new = '[phone message="' . sb_('Enter your phone number') . '" success="' . sb_t($shortcode['success']) . '"]';
                                            } else {
                                                $message_new = sb_t(sb_merge_fields($shortcode['success']));
                                            }
                                            $message_id = sb_send_message(sb_get_bot_id(), $conversation_id, $message_new, [], -1, ['event' => 'update-user'])['id'];
                                            sb_messaging_platforms_send_message($message_new, $source, $message_id);
                                            if ($slack)
                                                sb_send_slack_message($slack[0], $slack[1], $slack[2], $message_new, [], $conversation_id);
                                        }
                                        $valid = true;
                                    }
                                }
                            }
                        }
                        if (!$valid && !empty($shortcode['required-messaging-apps'])) {
                            $message_id = sb_send_message(sb_get_bot_id(), $conversation_id, $last_message)['id'];
                            sb_messaging_platforms_send_message($last_message, $source, $message_id);
                            if ($slack) {
                                sb_send_slack_message($slack[0], $slack[1], $slack[2], $last_message, [], $conversation_id);
                            }
                        }
                        $skip_chatbot = true;
                    } else {
                        $bot_messages = false;
                    }
                    break;
            }
        }
    }

    // Dialogflow and OpenAI
    if (($dialogflow_active || $open_ai_active) && !sb_get_setting($source_name . '-disable-chatbot')) {
        $bot_messages = false;
        $response = false;
        if (!$skip_chatbot && (!sb_get_setting('dialogflow-timetable') || !sb_office_hours())) {
            $voice_message = false;
            for ($i = 0; $i < count($attachments); $i++) {
                if (strpos($attachments[$i][0], 'voice_message')) {
                    $voice_message = $attachments[$i][1];
                    break;
                }
            }
            if ($dialogflow_active) {
                $response = sb_dialogflow_message($conversation_id, $message, -1, [sb_get_user_language($user_id)], $attachments, '', false, false, false, $voice_message);
                $messages = sb_isset($response, 'messages', []);
                $human_takeover = isset($response['human_takeover']);
            } else {
                $response_open_ai = sb_open_ai_message($message, false, false, $conversation_id, 'messaging-app', $voice_message);
                if ($response_open_ai[0]) {
                    $messages = is_string($response_open_ai[1]) ? [['message' => $response_open_ai[1]]] : (isset($response_open_ai[1]['message']) ? [$response_open_ai[1]] : sb_isset($response_open_ai[1], 'messages', is_array($response_open_ai[1]) ? $response_open_ai[1] : []));
                    $human_takeover = !empty($response_open_ai[3]);
                }
            }
            for ($i = 0; $i < count($messages); $i++) {
                $message_text = sb_isset($messages[$i], 'message', '');
                $message_attachments = sb_isset($messages[$i], 'attachments', []);
                $payload = sb_isset($messages[$i], 'payload', []);
                if (isset($payload['rich-message'])) {
                    $message_text .= $payload['rich-message'];
                }
                if ($message_text || $message_attachments) {
                    if (($source_name == 'tm' || $source_name == 'em') && (!empty($response) || !sb_dialogflow_is_unknow($response)) && sb_open_ai_is_valid($message_text)) {
                        if ($source_name == 'em') {
                            sb_email_create($user['id'], sb_get_setting('bot-name', 'Chatbot'), sb_get_setting('bot-image'), $message_text, $message_attachments, false, $conversation_id);
                        } else {
                            sb_send_sms($message_text, $source['phone'], true, $conversation_id, $message_attachments);
                        }
                        sb_send_agents_notifications($message_text, false, $conversation_id, $message_attachments, $user);
                    }
                    $delay = sb_get_setting('dialogflow-bot-delay');
                    if ($delay) {
                        sleep(intval($delay) / 1000);
                    }
                    sb_messaging_platforms_send_message($message_text, $source, sb_isset($messages[$i], 'id'), $message_attachments);
                }
                if ($payload) {
                    $source['attachments'] = $attachments;
                    sb_dialogflow_payload($payload, $conversation_id, $message, $source);
                }
                if ($slack) {
                    sb_send_slack_message($slack[0], $slack[1], $slack[2], $messages[$i]['message'], sb_isset($messages[$i], 'attachments', []), $conversation_id);
                }
            }
        }
    }

    // Bot messages
    if ($bot_messages || $human_takeover) {
        $is_new_conversation = !empty($source['new_conversation']);
        $bot_messages = ['offline', 'welcome'];
        if (!sb_get_multi_setting('follow-message', 'follow-disable-channels')) {
            array_push($bot_messages, 'follow_up');
        }
        if (!sb_get_multi_setting('subscribe-message', 'subscribe-disable-channels')) {
            array_push($bot_messages, 'subscribe');
        }
        if (!sb_get_multi_setting('privacy', 'privacy-disable-channels')) {
            array_push($bot_messages, 'privacy');
        }
        for ($i = 0; $i < count($bot_messages); $i++) {
            $bot_message = $i == 0 || empty($user['email']) ? sb_execute_bot_message($bot_messages[$i], $conversation_id, $last_message) : false;
            $message_2 = false;
            if ($i == 3 && $is_new_conversation && sb_get_multi_setting('welcome-message', 'welcome-active') && (!sb_get_multi_setting('welcome-message', 'welcome-disable-office-hours') || sb_office_hours())) {
                $message_2 = sb_get_multi_setting('welcome-message', 'welcome-msg');
            }
            if ($i == 4 && $is_new_conversation && sb_get_multi_setting('privacy', 'privacy-active')) {
                $message_2 = sb_get_multi_setting('privacy', 'privacy-msg');
            }
            if ($message_2) {
                $bot_message = ['id' => sb_send_message(sb_get_bot_id(), $conversation_id, $message_2)['id'], 'message' => $message_2];
            }
            if ($bot_message) {
                sb_messaging_platforms_send_message($bot_message['message'], $source, $bot_message['id']);
                if ($slack) {
                    sb_send_slack_message($slack[0], $slack[1], $slack[2], $bot_message['message'], [], $conversation_id);
                }
            }
        }
    }

    // Slack
    if ($slack) {
        sb_send_slack_message($slack[0], $slack[1], $slack[2], $message, $attachments, $conversation_id);
    }
    return $human_takeover ? 'human_takeover' : true;
}

function sb_messaging_platforms_send_message($message, $conversation, $message_id = false, $attachments = []) {
    $conversation = is_numeric($conversation) ? sb_db_get('SELECT id, user_id, source, extra FROM sb_conversations WHERE id = ' . $conversation) : $conversation;
    $platform_value = sb_isset($conversation, 'platform_value');
    $user_id = $conversation['user_id'];
    if (defined('SB_DIALOGFLOW')) {
        $message = sb_google_translate_auto($message, $user_id);
    }
    switch ($conversation['source']) {
        case 'ig':
        case 'fb':
            return sb_messenger_send_message($platform_value ? $platform_value : sb_get_user_extra($user_id, 'facebook-id'), isset($conversation['page_id']) ? $conversation['page_id'] : $conversation['extra'], $message, $attachments, $message_id);
        case 'wa':
            return sb_whatsapp_send_message($platform_value ? $platform_value : sb_get_user_extra($user_id, 'phone'), $message, $attachments, $conversation['extra']);
        case 'tg':
            return sb_telegram_send_message($platform_value ? $platform_value : sb_isset($conversation, 'chat_id', $conversation['extra']), $message, $attachments);
        case 'wc':
            return sb_wechat_send_message($platform_value ? $platform_value : sb_get_user_extra($user_id, 'wechat-id'), $message, $attachments);
        case 'tw':
            return sb_twitter_send_message($platform_value ? $platform_value : sb_get_user_extra($user_id, 'twitter-id'), $message, $attachments);
        case 'bm':
            return sb_gbm_send_message($platform_value ? $platform_value : sb_get_user_extra($user_id, 'gbm-id'), $message, $attachments);
        case 'vb':
            return sb_viber_send_message($platform_value ? $platform_value : sb_get_user_extra($user_id, 'viber-id'), $message, $attachments);
        case 'ln':
            return sb_line_send_message($platform_value ? $platform_value : sb_get_user_extra($user_id, 'line-id'), $message, $attachments, $conversation['id']);
    }
    return false;
}

function sb_send_sms($message, $to, $template = true, $conversation_id = true, $attachments = false) {
    $settings = sb_get_setting('sms');
    $to_agents = $to == 'agents' || $to == 'all-agents' || strpos($to, 'department-') !== false;

    // Retrive phone number
    if ($to_agents) {
        $phones = sb_db_get('SELECT A.id, value FROM sb_users A, sb_users_data B WHERE A.id = B.user_id AND (user_type = "agent" OR user_type = "admin") AND slug = "phone"' . ($to == 'agents' ? ' AND (department IS NULL OR department = "")' : (strpos($to, 'department-') !== false ? ' AND department = ' . substr($to, 11) : '')), false);
        $online_agents_ids = sb_get_online_user_ids(true);
        for ($i = 0; $i < count($phones); $i++) {
            if (!in_array($phones[$i]['id'], $online_agents_ids)) {
                sb_send_sms($message, $phones[$i]['value'], $template, $conversation_id, $attachments);
            }
        }
        return false;
    } else if (strpos($to, '+') === false && substr($to, 0, 2) != '00') {
        $to = sb_get_user_extra($to, 'phone');
        if (empty($to)) {
            return false;
        }
    }

    // Recipient user details, security, and merge fields
    $user = sb_get_user_by('phone', $to);
    $user_id = sb_isset($user, 'id');
    if (!sb_is_agent() && !sb_is_agent($user) && sb_get_active_user_ID() != $user_id && empty($GLOBALS['SB_FORCE_ADMIN'])) {
        return sb_error('security-error', 'sb_send_sms');
    }
    if (defined('SB_DIALOGFLOW')) {
        $message = sb_google_translate_auto($message, $user_id);
    }
    $message_template = $template ? sb_t($settings[sb_is_agent() && empty($GLOBALS['SB_FORCE_ADMIN']) && !$to_agents ? 'sms-message-user' : 'sms-message-agent']) : false;
    $message = $message_template ? str_replace('{message}', $message, $message_template) : $message;
    $message = str_replace(['{conversation_url_parameter}', '{recipient_name}', '{sender_name}', '{recipient_email}', '{sender_email}'], [$conversation_id && $user ? ('?conversation=' . $conversation_id . '&token=' . $user['token']) : '', sb_get_user_name($user), sb_get_user_name(), sb_isset($user, 'email'), sb_isset(sb_get_active_user(), 'email', '')], sb_merge_fields($message));

    // Send the SMS
    $message = sb_clear_text_formatting(strip_tags($message));
    $query = ['Body' => $message, 'From' => $settings['sms-sender'], 'To' => $to];
    if ($attachments) {
        $mime_types = ['jpeg', 'jpg', 'png', 'gif'];
        for ($i = 0; $i < count($attachments); $i++) {
            $attachment = is_array($attachments[$i]) ? $attachments[$i][1] : $attachments[$i];
            if (in_array(pathinfo($attachment, PATHINFO_EXTENSION), $mime_types)) {
                $query['MediaUrl' . $i] = $attachment;
            } else {
                $message .= PHP_EOL . PHP_EOL . $attachment;
            }
        }
        $query['Body'] = $message;
        $query = http_build_query($query);
        if (strpos($query, 'MediaUrl')) {
            $query = str_replace(['MediaUrl0', 'MediaUrl1', 'MediaUrl2', 'MediaUrl3', 'MediaUrl4', 'MediaUrl5', 'MediaUrl6', 'MediaUrl7', 'MediaUrl8', 'MediaUrl9'], 'MediaUrl', $query);
        }
    }
    $response = sb_curl('https://api.twilio.com/2010-04-01/Accounts/' . $settings['sms-user'] . '/Messages.json', $query, ['Authorization: Basic  ' . base64_encode($settings['sms-user'] . ':' . $settings['sms-token'])]);
    sb_webhooks('SBSMSSent', array_merge($query, $response));
    return $response;
}

?>
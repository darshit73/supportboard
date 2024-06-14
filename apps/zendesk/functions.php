<?php

/*
 * ==========================================================
 * ZENDESK APP
 * ==========================================================
 *
 * Zendesk app main file. © 2017-2023 board.support. All rights reserved.
 *
 * 1.
 * 2.
 * 3.
 *
 */

define('SB_ZENDESK', '1.0.0');

function sb_zendesk_get_conversation_details($user_id, $conversation_id = false, $zendesk_id = false, $email = false, $phone = false) {
    $code = '<h3><img src="' . SB_URL . '/media/apps/zendesk.svg"/> Zendesk</h3>';
    $sync = false;
    if (!$zendesk_id) {
        $zendesk_id = sb_get_user_extra($user_id, 'zendesk-id');
        if (!$zendesk_id) {
            $zendesk_id = sb_zendesk_curl('users/search.json?query=' . ($email ? 'email:' . $email : 'phone:' . str_replace('+', '', $phone)));
            if (!isset($zendesk_id['users'])) return $zendesk_id;
            if ($zendesk_id && count($zendesk_id)) {
                $zendesk_id = $zendesk_id[0]['id'];
                sb_add_new_user_extra($user_id, ['zendesk-id' => [$zendesk_id, 'Zendesk ID']]);
            }
        }
    }
    if ($zendesk_id) {
        $tickets = [];
        $code .= '<div class="sb-list-items sb-list-links">';
        $tickets = sb_zendesk_curl('users/' . $zendesk_id . '/tickets/requested');
        if (isset($tickets['tickets'])) {
            $tickets = $tickets['tickets'];
        } else {
            sb_update_user_value($user_id, 'zendesk-id', false);
            $tickets = [];
        }
        $count = count($tickets);
        if ($count) {
            $url = 'https://' . sb_get_multi_setting('zendesk', 'zendesk-domain') . '.zendesk.com/agent/tickets/';
            for ($i = 0; $i < count($tickets); $i++) {
                $ticket = $tickets[$i];
                $status = substr($ticket['status'], 0, 1);
                $sync_2 = sb_isset($ticket, 'external_id') == $conversation_id;
                if ($sync_2) $sync = true;
                $code .= '<a href="' . $url . $ticket['id'] . '" target="_blank" data-id="' . $ticket['id'] . '"' . ($sync_2 ? ' class="sb-zendesk-sync"' : '') . '><span><i class="sb-zendesk-status-' . $status. '">' . strtoupper($status) . '</i>' . $ticket['description'] . '</span><span>#' . $ticket['id'] . ' <span class="sb-zendesk-date">' . str_replace(['T', 'Z'], [' ', ''], $ticket['updated_at']) . '</span></span>' . ($sync_2 ? '<i id="sb-zendesk-update-ticket" class="sb-icon-refresh"></i>' : '') . '</a>';
            }
        }
        $code .= '</div>';
    }
    return $code . ($sync ? '' : '<a id="sb-zendesk-btn" class="sb-btn">' . sb_('Send to Zendesk') . '</a>');
}

function sb_zendesk_create_ticket($conversation_id) {
    $zendesk_ticket_id = false;
    if (is_numeric($conversation_id)) {
        $messages = sb_get_conversation(false, $conversation_id)['messages'];
    } else if (is_array($conversation_id)) {
        $messages = $conversation_id[2];
        $zendesk_ticket_id = $conversation_id[0];
        $conversation_id = $conversation_id[1];
    }
    $count = count($messages);
    if ($count) {
        $errors = [];
        $zendesk_ids = [];
        for ($i = 0; $i < $count; $i++) {
            $message = $messages[$i];
            $user_id = $message['user_id'];

            // User
            $user = sb_get_user($message['user_id']);
            $zendesk_id = sb_isset($zendesk_ids, $user_id);
            if (!$zendesk_id) {
                $zendesk_id = sb_get_user_extra($user['id'], 'zendesk-id');
                if ($zendesk_id) $zendesk_ids[$user['id']] = $zendesk_id;
            }
            if (!$zendesk_id) {
                $user_details = sb_zendesk_get_user_array($user['id']);
                $response = sb_zendesk_curl('users/create_or_update', ['user' => $user_details], 'POST');
                if ($response && isset($response['user'])) {
                    $zendesk_id = $response['user']['id'];
                    sb_add_new_user_extra($user['id'], ['zendesk-id' => [$zendesk_id, 'Zendesk ID']]);
                    $zendesk_ids[$user['id']] = $zendesk_id;
                }
            }

            // Message
            $attachments = $message['attachments'];
            $query = sb_zendesk_get_ticket_array($conversation_id, $message['message'], $attachments, $zendesk_ids[$user_id]);
            if ($zendesk_ticket_id) {
                $query['comment']['author_id'] = $zendesk_ids[$user_id];
                unset($query['requester_id']);
                unset($query['external_id']);
                $response = sb_zendesk_curl('tickets/' . $zendesk_ticket_id, ['ticket' => $query], 'PUT');
            } else {
                $response = sb_zendesk_curl('tickets', ['ticket' => $query], 'POST');
                $zendesk_ticket_id = $response['ticket']['id'];
            }
            if (!$response || !isset($response['ticket'])) {
                array_push($errors, $response);
            }
        }
        return count($errors) ? $errors : true;
    }
    return false;
}

function sb_zendesk_update_ticket($conversation_id, $zendesk_ticket_id) {
    $comments_count = sb_isset(sb_zendesk_curl('tickets/' . $zendesk_ticket_id . '/comments/count'), 'count');
    if ($comments_count) {
        $comments_count = $comments_count['value'];
        $messages = sb_get_conversation(false, $conversation_id)['messages'];
        if (count($messages) > $comments_count) {
            return sb_zendesk_create_ticket([$zendesk_ticket_id, $conversation_id, array_slice($messages, $comments_count)]);
        }
    }
    return false;
}

function sb_zendesk_upload($url) {
    $path = substr($url, strrpos(substr($url, 0, strrpos($url, '/')), '/'));
    return sb_zendesk_curl('uploads?filename=' . basename($path), file_get_contents(sb_upload_path() . $path), 'UPLOAD');
}

function sb_zendesk_curl($url_part, $post_fields = '', $type = 'GET') {
    $settings = sb_get_setting('zendesk');
    $is_upload = $type == 'UPLOAD';
    $header = ['Authorization: Basic ' . base64_encode($settings['zendesk-email'] . '/token:' . $settings['zendesk-key']), $is_upload ? 'Content-Type: application/binary' : 'Content-Type: application/json'];
    $response = sb_curl('https://' . $settings['zendesk-domain'] . '.zendesk.com/api/v2/' . $url_part, $post_fields ? ($is_upload ? $post_fields : json_encode($post_fields, JSON_INVALID_UTF8_IGNORE | JSON_UNESCAPED_UNICODE)) : '', $header, $type);
    return $type == 'GET' || $type == 'PUT' ? json_decode($response, true) : $response;
}

function sb_zendesk_get_user_array($user_id) {
    $user = sb_get_user($user_id);
    $array = ['name' => $user['first_name'] . ' ' . $user['last_name'], 'role' => sb_is_agent($user) ? 'agent' : 'end-user', 'verified' => true];
    $phone = sb_get_user_extra($user['id'], 'phone');
    if ($user['email']) $array['email'] = $user['email'];
    if ($phone) $array['phone'] = $phone;
    return $array;
}

function sb_zendesk_get_ticket_array($conversation_id, $message, $attachments, $zendesk_id) {
    $query = ['external_id' => $conversation_id, 'comment' => ['body' => $message], 'requester_id' => $zendesk_id];
    if ($attachments) {
        $ids = [];
        $attachments = json_decode($attachments, true);
        for ($i = 0; $i < count($attachments); $i++) {
            $response_attachment = sb_isset(sb_zendesk_upload($attachments[$i][1]), 'upload');
            if ($response_attachment) {
                array_push($ids, $response_attachment['token']);
            }
        }
        if (count($ids)) {
            $query['comment']['uploads'] = $ids;
            if (empty($query['comment']['body'])) {
                $query['comment']['body'] = basename($attachments[0][1]);
            }
        }
    }
    return $query;
}

?>
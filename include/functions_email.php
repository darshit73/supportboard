<?php

/*
 * ==========================================================
 * FUNCTIONS_EMAIL.PHP
 * ==========================================================
 *
 * Email functions file. © 2017-2024 board.support. All rights reserved.
 *
 * ----------------------------------------------------------
 * EMAIL
 * ----------------------------------------------------------
 *
 * 1. Create the email contents
 * 2. Create the email contents secondary function
 * 3. Send an email to the given address
 * 4. Send an email to the address of the given user ID
 * 5. Send a test email
 * 6. Check if the active user can send the requested email
 * 7. Email piping function
 * 8. Send the successfull subscription email
 * 9. Append the email header and the signature to an email content
 * 10. Manage email attachments
 * 11. Return the conversation messges as HTML code
 * 12. Remove an email notification from the email cron job list
 * 13. Convert the text formatting of Support Board to HTML
 * 14. Remove the text formatting of Support Board
 * 15. Newsletter
 * 16. Email cron job notifications
 * 17. Convert rich messages to HTML
 *
 */

function sb_email_create($recipient_id, $sender_name, $sender_profile_image, $message, $attachments = [], $department = false, $conversation_id = false) {
    $recipient = false;
    $recipient_name = '';
    $recipient_email = '';
    $recipient_user_type = 'agent';
    if ($recipient_id == 'email-test') {
        $recipient_name = 'Test user';
    } else if ($recipient_id == -1 || $recipient_id == 'agents' || $recipient_id == 'all-agents' || strpos($recipient_id, 'department-') !== false) {
        $department = $department ? $department : (strpos($recipient_id, 'department-') !== false ? substr($recipient_id, 11) : false);
        $agents = sb_db_get('SELECT id, first_name, last_name, email FROM sb_users WHERE (user_type = "agent"' . (sb_get_setting('stop-notify-admins') ? '' : ' OR user_type = "admin"') . ') ' . (empty($department) || $department == -1 ? ($recipient_id == 'agents' ? ' AND (department IS NULL OR department = "")' : '') : ' AND department = ' . sb_db_escape($department)), false);
        $online_agents_ids = sb_get_online_user_ids(true);
        for ($i = 0; $i < count($agents); $i++) {
            if (!in_array($agents[$i]['id'], $online_agents_ids)) {
                $recipient_name .= sb_get_user_name($agents[$i]) . ', ';
                $recipient_email .= $agents[$i]['email'] . ',';
                if ($i == 0) {
                    $recipient_id = $agents[$i]['id'];
                }
            }
        }
        $recipient_name = mb_substr($recipient_name, 0, -2);
        $recipient_email = substr($recipient_email, 0, -1);
    } else {
        if (!sb_email_security($recipient_id) && sb_get_active_user_ID() != $recipient_id) {
            return sb_error('security-error', 'sb_email_create');
        }
        $recipient = sb_get_user($recipient_id);
        if (!$recipient || !$recipient['email']) {
            return new SBValidationError('email-not-found');
        }
        $recipient_name = sb_get_user_name($recipient);
        $recipient_email = $recipient['email'];
        $recipient_user_type = $recipient['user_type'];
    }
    if (defined('SB_DIALOGFLOW') && strpos($message, '<div style') === false) {
        $message = sb_google_translate_auto($message, $recipient_id);
    }
    $subject_and_body = sb_email_get_subject_and_body($recipient_user_type, $recipient_id);
    $email = sb_email_create_content($subject_and_body[0], $subject_and_body[1], $attachments, ['conversation_url_parameter' => ($recipient && $conversation_id ? ('?conversation=' . $conversation_id . '&token=' . $recipient['token']) : ''), 'message' => $message, 'recipient_name' => $recipient_name, 'sender_name' => $sender_name, 'sender_profile_image' => str_replace('user.svg', 'user.png', $sender_profile_image), 'conversation_id' => $conversation_id]);
    $piping = sb_email_piping_suffix($conversation_id);
    $delimiter_text = 'Please type your reply above this line';
    $piping_delimiter = !empty($piping) && sb_get_multi_setting('email-piping', 'email-piping-delimiter') ? ('<div style="color:#b5b5b5">### ' . (is_numeric($recipient_id) ? sb_t($delimiter_text, sb_get_user_language($recipient_id)) : sb_($delimiter_text)) . ' ###</div><br><br>') : '';
    sb_webhooks('SBEmailSent', ['recipient_id' => $recipient_id, 'message' => $message, 'attachments' => $attachments]);
    return sb_email_send($recipient_email, $email[0], $piping_delimiter . $email[1], $piping);
}

function sb_email_get_subject_and_body($recipient_user_type, $recipient_id = false) {
    $is_agent = sb_is_agent($recipient_user_type);
    $suffix = $is_agent ? 'agent' : 'user';
    $settings = sb_get_multilingual_setting('emails', 'email-' . $suffix, sb_get_user_language(is_numeric($recipient_id) ? $recipient_id : false));
    $body = trim($settings['email-' . $suffix . '-content']);
    if (empty($body) && defined($is_agent ? 'SB_CLOUD_EMAIL_BODY_AGENTS' : 'SB_CLOUD_EMAIL_BODY_USERS')) {
        $body = $is_agent ? SB_CLOUD_EMAIL_BODY_AGENTS : SB_CLOUD_EMAIL_BODY_USERS;
        if (!$is_agent && defined('DIRECT_CHAT_URL')) {
            require_once(SB_CLOUD_PATH . '/account/functions.php');
            $body = str_replace('{conversation_link}', DIRECT_CHAT_URL . '/' . account_chat_id(account()['user_id']) . '?chat=open', $body);
        }
    }
    return [$settings['email-' . $suffix . '-subject'], $body];
}

function sb_email_create_content($subject, $body, $attachments, $replacements) {
    if (empty($attachments)) {
        $attachments = [];
    }
    if (!$subject) {
        $subject = 'New message from {sender_name}';
    }
    if (!$body) {
        $body = 'Hello {recipient_name}!<br />{message}{attachments}';
    }
    $subject = str_replace(['{recipient_name}', '{sender_name}'], [$replacements['recipient_name'], sb_isset($replacements, 'sender_name')], $subject);
    $body = str_replace(['{conversation_url_parameter}', '{recipient_name}', '{sender_name}', '{sender_profile_image}', '{message}', '{attachments}', '{conversation_link}'], ['conversation_url_parameter' => sb_isset($replacements, 'conversation_url_parameter', ''), $replacements['recipient_name'], sb_isset($replacements, 'sender_name'), str_replace('user.svg', 'user.png', sb_isset($replacements, 'sender_profile_image')), $replacements['message'], sb_email_attachments_code($attachments), ((sb_is_cloud() ? CLOUD_URL : SB_URL . '/admin.php') . (isset($replacements['conversation_id']) ? '?conversation=' . $replacements['conversation_id'] : ''))], $body);
    return [$subject, $body];
}

function sb_email_send($to, $subject, $body, $sender_suffix = '') {
    $settings = sb_get_setting('email-server');
    $host = sb_isset($settings, 'email-server-host');
    if (!$host && sb_is_cloud()) {
        $settings = ['email-server-host' => CLOUD_SMTP_HOST, 'email-server-user' => CLOUD_SMTP_USERNAME, 'email-server-password' => CLOUD_SMTP_PASSWORD, 'email-server-from' => CLOUD_SMTP_SENDER, 'email-sender-name' => CLOUD_SMTP_SENDER_NAME, 'email-server-port' => CLOUD_SMTP_PORT];
        $host = CLOUD_SMTP_HOST;
    }
    if (empty($to)) {
        return false;
    }
    if ($host) {
        require_once SB_PATH . '/vendor/phpmailer/PHPMailerAutoload.php';
        $port = $settings['email-server-port'];
        $mail = new PHPMailer;
        $body = nl2br(trim(sb_text_formatting_to_html($body)));
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->SMTPAuth = true;
        $mail->Username = $settings['email-server-user'];
        $mail->Password = $settings['email-server-password'];
        $mail->SMTPSecure = $port == 25 ? '' : ($port == 465 ? 'ssl' : 'tls');
        $mail->Port = $port;
        $mail->setFrom($settings['email-server-from'], sb_isset($settings, 'email-sender-name', '') . $sender_suffix);
        $mail->isHTML(true);
        $mail->Subject = trim($subject);
        $mail->Body = $body;
        $mail->AltBody = $body;
        $mail->SMTPOptions = ['ssl' => ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true]];
        if (strpos($to, ',') > 0) {
            $emails = explode(',', $to);
            for ($i = 0; $i < count($emails); $i++) {
                $mail->addAddress($emails[$i]);
            }
        } else {
            $mail->addAddress($to);
        }
        if (!$mail->send()) {
            return sb_error('email-error', 'sb_email_send', $mail->ErrorInfo);
        } else {
            return true;
        }
    } else {
        return mail($to, $subject, $body);
    }
}

function sb_email($recipient_id, $message, $attachments = [], $sender_id = -1) {
    if (!$recipient_id || empty($message)) {
        return new SBValidationError('missing-user-id-or-message');
    }
    if (!sb_email_security($recipient_id)) {
        return sb_error('security-error', 'sb_email');
    }
    $sender = $sender_id == -1 ? sb_get_active_user() : sb_get_user($sender_id);
    $user = sb_get_user($recipient_id);
    if ($sender && $user && isset($sender['id']) && isset($user['id'])) {
        if (!$user['email']) {
            return new SBValidationError('user-email-not-found');
        }
        $subject_and_body = sb_email_get_subject_and_body($user['user_type'], $recipient_id);
        $email = sb_email_create_content($subject_and_body[0], $subject_and_body[1], $attachments, ['message' => $message, 'recipient_name' => sb_get_user_name($user), 'sender_name' => sb_get_user_name($sender), 'sender_profile_image' => str_replace('user.svg', 'user.png', $sender['profile_image'])]);
        return sb_email_send($user['email'], $email[0], $email[1]);
    } else {
        return sb_error('user-or-sender-not-found', 'sb_email');
    }
}

function sb_email_send_test($to, $email_type) {
    $user = sb_get_active_user();
    $name = sb_get_user_name($user);
    $image = SB_URL . '/media/user.png';
    $attachments = [['Example link', $image], ['Example link two', $image]];
    $subject_and_body = sb_email_get_subject_and_body($email_type);
    $email = sb_email_create_content($subject_and_body[0], $subject_and_body[1], $attachments, ['message' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam', 'recipient_name' => $name, 'sender_name' => $name, 'sender_profile_image' => $user['profile_image']]);
    return sb_email_send($to, $email[0], $email[1]);
}

function sb_email_security($user_id) {
    if (sb_is_agent() || !empty($GLOBALS['SB_FORCE_ADMIN'])) {
        return true;
    } else {
        $user = sb_db_get('SELECT user_type FROM sb_users WHERE id = ' . $user_id);
        return !sb_is_error($user) && isset($user['user_type']) && sb_is_agent($user['user_type']);
    }
}

function sb_email_piping($force = false) {
    if (!$force && date('i') == sb_get_external_setting('cron-email-piping')) {
        return false;
    }
    sb_save_external_setting('cron-email-piping', date('i'));
    $settings = sb_get_setting('email-piping');
    if ($settings && !empty($settings['email-piping-active'])) {
        $port = $settings['email-piping-port'];
        $host = $settings['email-piping-host'];
        $all_emails = sb_isset($settings, 'email-piping-all');
        $today = date('d F Y');
        $last_check = sb_get_external_setting('email-piping-check');
        ini_set('default_socket_timeout', 5);
        imap_timeout(IMAP_OPENTIMEOUT, 5);
        $inbox = imap_open('{' . $host . ':' . $port . '/' . ($port == 143 || $port == 993 ? 'imap' : 'pop3') . ($port == 995 || $port == 993 ? '/ssl' : '') . ($port == 995 ? '/novalidate-cert' : '') . '}INBOX', $settings['email-piping-user'], $settings['email-piping-password']);
        if (function_exists('ini_restore')) {
            ini_restore('default_socket_timeout');
        }
        $attachments_path = sb_upload_path(false, true) . '/';
        $attachments_url = sb_upload_path(true, true) . '/';
        $is_s3 = sb_get_multi_setting('amazon-s3', 'amazon-s3-active') || defined('SB_CLOUD_AWS_S3');
        if ($inbox) {
            set_time_limit(sb_is_cloud() ? 100 : 1000);
            $emails = imap_search($inbox, 'ALL SINCE "' . (empty($last_check) ? $today : $last_check) . '"');
            if ($emails) {
                $department_id = sb_isset($settings, 'email-piping-department');
                $history = sb_get_external_setting('email-piping-history', []);
                $history_new = [];
                rsort($emails);
                foreach ($emails as $email_number) {
                    $overview = imap_headerinfo($inbox, $email_number, 0);
                    $follow_up = false;
                    if (!$overview || !isset($overview->senderaddress)) {
                        $overview = imap_fetch_overview($inbox, $email_number, 0)[0];
                        $to = $overview->to;
                        $from = $overview->from;
                        $follow_up = strpos($to, '| SB') ? $to : false;
                    } else {
                        $to = $overview->senderaddress;
                        $from = isset($overview->reply_toaddress) ? $overview->reply_toaddress : $overview->fromaddress;
                        $toaddress = $overview->toaddress;
                        if (strpos($toaddress, '?UTF-8') || strpos($toaddress, '7C_')) {
                            $toaddress = iconv_mime_decode($overview->toaddress, 0, 'UTF-8');
                        }
                        $follow_up = strpos($toaddress, '| SB') ? $toaddress : false;
                    }
                    if ($all_emails || $follow_up) {
                        $conversation_id = false;
                        $id = false;
                        if ($follow_up) {
                            $conversation_id = substr($follow_up, strpos($follow_up, '| SB') + 4);
                            $conversation_id = substr($conversation_id, 0, strpos($conversation_id, '<') - 1);
                            $conversation_id = explode('-', $conversation_id);
                            $id = hash('sha1', $conversation_id[1] . $overview->date);
                            $conversation_id = sb_db_escape($conversation_id[0], true);
                            if (!$conversation_id || !sb_db_get('SELECT id FROM sb_conversations WHERE id = ' . $conversation_id)) {
                                $follow_up = false;
                                $conversation_id = false;
                            }
                        }
                        if (!$follow_up) {
                            $id = hash('sha1', $from . $overview->date);
                        }
                        if (!in_array($id, $history) && !in_array($id, $history_new)) {
                            $from_email = mb_strpos($from, '<') ? trim(mb_substr($from, mb_strpos($from, '<') + 1, -1)) : $from;
                            $from_name = mb_strpos($from, '<') && mb_strpos($from, '=') === false && mb_strpos($from, '?') === false ? trim(mb_substr($from, 0, mb_strpos($from, '<'))) : '';
                            if (!$from_name) {
                                $from_name = preg_match_all('/[a-z0-9_\-\+\.]+@[a-z0-9\-]+\.([a-z]{2,4})(?:\.[a-z]{2})?/i', $from, $matches);
                                $from_name = count($matches) ? $matches[0] : $from;
                                if (is_array($from_name) && count($from_name)) {
                                    $from_name = $from_name[0];
                                }
                            }
                            $sender = sb_db_get('SELECT * FROM sb_users WHERE email = "' . sb_db_escape($from_email) . '" LIMIT 1');
                            if (!$sender) {
                                $name = sb_split_name(str_replace(['"', 'Re:', '_'], ['', '', ' '], $from_name));
                                $sender = sb_add_user(['email' => $from_email, 'first_name' => $name[0], 'last_name' => $name[1]]);
                                $sender = sb_db_get('SELECT * FROM sb_users WHERE id = ' . $sender);
                            }
                            if ($sender && ($follow_up || !sb_is_agent($sender))) {
                                $message = imap_fetchbody($inbox, $email_number, 1);
                                $structure = imap_fetchstructure($inbox, $email_number);
                                $agent = sb_is_agent($sender);

                                // Message decoding
                                $message_temp = false;
                                $position = strpos($message, ': multipart/alternative');
                                if ($position) {
                                    $message_temp = substr($message, strpos($message, ': text/plain'));
                                    $position = strpos($message_temp, 'Content-Type:');
                                    if ($position) {
                                        $message_temp = substr($message_temp, 0, $position);
                                    }
                                    $message_temp = substr($message_temp, strpos($message_temp, ': text/plain'));
                                    if ($message_temp) {
                                        $message = $message_temp;
                                    }
                                }
                                $position = strpos($message, ': base64');
                                if ($position) {
                                    $message_temp = substr($message, $position + 8);
                                    $position = strpos($message_temp, ': base64');
                                    if ($position) {
                                        $message_temp = substr($message_temp, 0, sb_mb_strpos_reverse($message_temp, PHP_EOL, $position));
                                    }
                                    $position = strpos($message_temp, '--');
                                    if ($position) {
                                        $message_temp = substr($message_temp, 0, $position);
                                    }
                                    $message_temp = str_replace(["\r", "\n"], '', $message_temp);
                                    $message_temp = imap_base64($message_temp);
                                    if ($message_temp) {
                                        $message = $message_temp;
                                    }
                                }
                                if (strpos($message, 'quoted-printable')) {
                                    $message = quoted_printable_decode($message);
                                } else {
                                    $encoding = isset($structure->parts) && count($structure->parts) ? $structure->parts[0]->encoding : ($structure->encoding && mb_detect_encoding($message) != 'UTF-8' ? $structure->encoding : -1);
                                    if ($encoding) {
                                        switch ($encoding) {
                                            case 0:
                                            case 1:
                                                $message = imap_8bit($message);
                                                break;
                                            case 2:
                                                $message = imap_binary($message);
                                                break;
                                            case 3:
                                                $message = imap_base64($message);
                                                break;
                                            case 4:
                                                $message = imap_qprint($message);
                                                break;
                                            default:
                                                if (strpos($message, ' =E')) {
                                                    $message = mb_convert_encoding($message, 'UTF-8', mb_detect_encoding($message, 'ISO-8859-1, ISO-8859-2'));
                                                    if (strpos($message, '=')) {
                                                        $message = str_replace(['=AD', '=01', '=02', '=03', '=04', '=05', '=06', '=07', '=08', '=09', '=0A', '=0B', '=0C', '=0D', '=0E', '=0F', '=10', '=11', '=12', '=13', '=14', '=15', '=16', '=17', '=18', '=19', '=1A', '=1B', '=1C', '=1D', '=1E', '=1F', '=7F', '=80', '=81', '=82', '=83', '=84', '=85', '=86', '=87', '=88', '=89', '=8A', '=8B', '=8C', '=8D', '=8E', '=8F', '=90', '=91', '=92', '=93', '=94', '=95', '=96', '=97', '=98', '=99', '=9A', '=9B ', '=9C ', '=9D ', '=9E ', '=9F'], '', $message);
                                                        $message = str_replace(['=A0', '=20'], ' ', $message);
                                                        $message = str_replace(['=21', '=22', '=23', '=24', '=25', '=26', '=27', '=28', '=29', '=2A', '=2B', '=2C', '=2D', '=2E', '=2F', '=30', '=39', '=3A', '=3B', '=3C', '=3D', '=3E', '=3F', '=40', '=41', '=5A', '=5B', '=5C', '=5D', '=5E', '=5F', '=60', '=61', '=7A', '=7B', '=7C', '=7D', '=7E', '=A1', '=A2', '=A3', '=A4', '=A5', '=A6', '=A7', '=A8', '=A9', '=AA', '=AB', '=AC', '=AE', '=AF', '=B0', '=B1', '=B2', '=B3', '=B4', '=B5', '=B6', '=B7', '=B8', '=B9', '=BA', '=BB', '=BC', '=BD', '=BE', '=BF', '=C0', '=C1', '=C2', '=C3', '=C4', '=C5', '=C6', '=C7', '=C8', '=C9', '=CA', '=CB', '=CC', '=CD', '=CE', '=CF', '=D0', '=D1', '=D2', '=D3', '=D4', '=D5', '=D6', '=D7', '=D8', '=D9', '=DA', '=DB', '=DC', '=DD', '=DE', '=DF', '=E0', '=E1', '=E2', '=E3', '=E4', '=E5', '=E6', '=E7', '=E8', '=E9', '=EA', '=EB', '=EC', '=ED', '=EE', '=EF', '=F0', '=F1', '=F2', '=F3', '=F4', '=F5', '=F6', '=F7', '=F8', '=F9', '=FA', '=FB', '=FC', '=FD', '=FE', '=FF'], ['!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', '', '', '-', '.', '/', '0', '9', ':', ';', '<', '=', '>', '?', '@', 'A', 'Z', '[', '\\', ']', '^', '_', '`', 'a', 'z', '{', '|', '}', '~', '¡', '¢', '£', '¤', '¥', '¦', '§', '¨', '©', 'ª', '«', '¬', '®', '¯', '°', '±', '²', '³', '´', 'µ', '¶', '·', '¸', '¹', 'º', '»', '¼', '½', '¾', '¿', 'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', '×', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷', 'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ', 'ÿ'], $message);
                                                    }
                                                }
                                                $message = quoted_printable_decode($message);
                                                break;
                                        }
                                    }
                                }
                                if (mb_detect_encoding($message) != 'UTF-8') {
                                    $encoding = mb_detect_encoding($message);
                                    if ($encoding) {
                                        $message = mb_convert_encoding($message, 'UTF-8', $encoding);
                                    }
                                }

                                // Message formatting
                                $message = str_replace(['<br>', '<br/>', '<br />'], PHP_EOL, $message);
                                $position = mb_strpos($message, "|\r\nSB");
                                if ($position) {
                                    $message = mb_substr($message, 0, sb_mb_strpos_reverse($message, PHP_EOL, $position));
                                }
                                $position = mb_strpos($message, ' | SB');
                                if ($position) {
                                    $message = mb_substr($message, 0, sb_mb_strpos_reverse($message, PHP_EOL, $position));
                                }
                                $position = mb_strpos($message, $from_name . ' <');
                                if ($position) {
                                    $message = mb_substr($message, 0, sb_mb_strpos_reverse($message, PHP_EOL, $position));
                                }
                                $position = mb_strpos($message, 'Content-Type:');
                                if ($position) {
                                    $message = mb_substr($message, mb_strpos(mb_substr($message, $position), PHP_EOL) + $position);
                                    $position = mb_strpos($message, 'Content-Type:');
                                    if ($position) {
                                        $message = mb_substr($message, 0, $position);
                                    }
                                }
                                $position = mb_strpos($message, '______________________________');
                                if ($position) {
                                    $message = mb_substr($message, 0, $position);
                                }
                                $position = mb_strpos($message, 'Outlook');
                                if ($position) {
                                    $message = mb_substr($message, 0, mb_strrpos(mb_substr($message, 0, $position), "\n"));
                                }
                                $position = mb_strpos($message, 'Content-Transfer-Encoding:');
                                $position_2 = mb_strpos($message, 'Content-Type: text/plain');
                                if ($position) {
                                    if ($position_2 && $position_2 < $position) {
                                        $message = mb_substr($message, mb_strpos($message, "\n", $position_2), mb_strpos($message, "\n", $position));
                                    } else {
                                        $message = mb_substr($message, mb_strpos($message, "\n", $position));
                                    }
                                }
                                $strings_check = ['>:', '> wrote:', '--0'];
                                for ($i = 0; $i < count($strings_check); $i++) {
                                    if (mb_strpos($message, $strings_check[$i])) {
                                        $message = mb_substr($message, 0, sb_mb_strpos_reverse($message, PHP_EOL, mb_strpos($message, $strings_check[$i])));
                                    }
                                }
                                $message = str_replace(['wrote:' . PHP_EOL, 'wrote:'], '', $message);
                                if ($settings['email-piping-delimiter'] && mb_strpos($message, '### ')) {
                                    $message = str_replace('> ###', '###', $message);
                                    $message = mb_substr($message, 0, mb_strpos($message, '### '));
                                }
                                if (!empty($message)) {
                                    $message = preg_replace('/(<(script|style)\b[^>]*>).*?(<\/\2>)/is', "$1$3", $message);
                                    $message = strip_tags($message);
                                    $message = preg_replace("/\[image[\s\S]+?\]/", '', $message);
                                    $message = str_replace('&nbsp;', ' ', $message);
                                    while (mb_strpos($message, PHP_EOL . '> ')) {
                                        $message = mb_substr($message, 0, mb_strpos($message, PHP_EOL . '> ') - 2);
                                    }
                                    while (strpos($message, ' ' . PHP_EOL) !== false || strpos($message, PHP_EOL . ' ') !== false) {
                                        $message = str_replace([' ' . PHP_EOL, PHP_EOL . ' '], PHP_EOL, $message);
                                    }
                                    while (strpos($message, PHP_EOL . PHP_EOL . PHP_EOL) !== false) {
                                        $message = str_replace(PHP_EOL . PHP_EOL . PHP_EOL, PHP_EOL . PHP_EOL, $message);
                                    }
                                    $message = trim($message);
                                    $message = preg_replace("/(\n){3,}/", "\n\n", str_replace(["\r", "\t"], "\n", str_replace('  ', ' ', $message)));
                                    while (strpos($message, "\n ") !== false) {
                                        $message = str_replace("\n ", "\n", $message);
                                    }
                                    while (strpos($message, "\n\n\n") !== false) {
                                        $message = str_replace("\n\n\n", "\n\n", $message);
                                    }
                                }

                                // Attachments
                                $attachments = sb_email_piping_attachments($structure, $inbox, $email_number);
                                $attachments_2 = [];
                                if (count($attachments) && !file_exists($attachments_path)) {
                                    mkdir($attachments_path, 0755, true);
                                }
                                for ($i = 0; $i < count($attachments); $i++) {
                                    $file_name_attachment = sb_sanatize_file_name($attachments[$i]['filename']);
                                    $file_name = rand(100000, 999999999) . '_' . $file_name_attachment;
                                    $file_path = $attachments_path . $file_name;
                                    $file_url = $attachments_url . $file_name;
                                    sb_file($file_path, $attachments[$i]['attachment']);
                                    if ($is_s3 && file_exists($file_path)) {
                                        $url_aws = sb_aws_s3($file_path);
                                        if (strpos($url_aws, 'http') === 0) {
                                            $file_url = $url_aws;
                                            unlink($file_path);
                                        }
                                    }
                                    array_push($attachments_2, [$file_name_attachment, $file_url]);
                                }

                                // Send message
                                if (!empty($message)) {
                                    $GLOBALS['SB_FORCE_ADMIN'] = true;
                                    if (!$follow_up) {
                                        $subject = sb_string_slug(trim(mb_decode_mimeheader($overview->subject)), 'string');
                                        if (in_array(mb_substr($subject, 0, 1), ['?'])) {
                                            $subject = mb_substr($subject, 1);
                                        }
                                        if (mb_substr($subject, 0, 3) == 'Re:') {
                                            $subject = mb_substr($subject, 3);
                                        }
                                        $conversation_id = sb_isset(sb_new_conversation($sender['id'], 2, $subject, $department_id, -1, 'em'), 'details', [])['id'];
                                    }
                                    sb_send_message($sender['id'], $conversation_id, $message, $attachments_2, ($agent ? 1 : 2));

                                    // Notifications
                                    $recipient = sb_get_user_from_conversation($conversation_id, !$agent);
                                    if (isset($recipient['id']) && !sb_is_user_online($recipient['id']) && (!sb_get_setting('stop-notify-admins') || !sb_is_agent($recipient, true, true))) {
                                        if (($agent && sb_get_setting('notify-user-email')) || (!$agent && sb_get_setting('notify-agent-email'))) {
                                            sb_email_create($recipient['id'], sb_get_user_name($sender), $sender['profile_image'], $message, $attachments_2, false, $conversation_id);
                                        }
                                        if (($agent && sb_get_multi_setting('sms', 'sms-active-users')) || (!$agent && sb_get_multi_setting('sms', 'sms-active-agents'))) {
                                            $phone = sb_get_user_extra($recipient['id'], 'phone');
                                            if ($phone) {
                                                sb_send_sms($message, $phone, true, $conversation_id, $attachments_2);
                                            }
                                        }
                                    } else if (!$follow_up && sb_get_setting('notify-agent-email')) {
                                        sb_send_agents_notifications($message, false, $conversation_id, $attachments_2);
                                    }

                                    // Dialogflow and Slack
                                    if (!$agent) {
                                        if (defined('SB_DIALOGFLOW') && sb_get_setting('dialogflow-email-piping')) {
                                            sb_messaging_platforms_functions($conversation_id, $message, $attachments_2, $sender, ['source' => 'em', 'user_id' => $sender['id'], 'conversation_id' => $conversation_id]);
                                            sb_db_query('DELETE FROM sb_messages WHERE conversation_id = ' . $conversation_id . ' AND payload LIKE "%NO_MATCH%" AND creation_time < "' . gmdate('Y-m-d H:i:s', time() + 60) . '" ORDER BY id DESC LIMIT 1');
                                        } else if (defined('SB_SLACK') && sb_slack_can_send($conversation_id)) {
                                            sb_send_slack_message($sender['id'], sb_get_user_name($sender), $sender['profile_image'], $message, $attachments_2, $conversation_id);
                                        }
                                    }

                                    $GLOBALS['SB_FORCE_ADMIN'] = false;
                                }
                                array_push($history_new, $id);
                            }
                        }
                    }
                }
                if ($last_check != $today) {
                    $history = [];
                }
                sb_save_external_setting('email-piping-history', array_merge($history, $history_new));
            }
            if ($last_check != $today) {
                sb_save_external_setting('email-piping-check', $today);
            }
            imap_close($inbox);
            return true;
        }
        return sb_error('connection-error', 'sb_email_piping', imap_last_error());
    }
    return true;
}

function sb_email_piping_attachments($structure, &$inbox, &$email_number, $part_index = false) {
    $attachments = [];
    $count = isset($structure->parts) ? count($structure->parts) : 0;
    for ($i = 0; $i < $count; $i++) {
        $part = $structure->parts[$i];
        $attachment = false;
        $parameters = $part->ifdparameters ? $part->dparameters : ($part->ifparameters ? $part->parameters : []);
        foreach ($parameters as $object) {
            if (in_array(strtolower($object->attribute), ['name', 'filename'])) {
                $attachment = ['filename' => $object->value];
            }
        }
        if ($attachment) {
            $index = (($part_index ? $part_index : $i) + 1);
            $attachment_temp = imap_fetchbody($inbox, $email_number, $index . '.' . ($i + 1));
            if (!$attachment_temp)
                $attachment_temp = imap_fetchbody($inbox, $email_number, $index);
            if ($part->encoding == 3) {
                $attachment_temp = base64_decode($attachment_temp);
            } else if ($part->encoding == 4) {
                $attachment_temp = quoted_printable_decode($attachment_temp);
            }
            $attachment['attachment'] = $attachment_temp;
            array_push($attachments, $attachment);
        }
        if (property_exists($part, 'parts') && $part->parts) {
            array_merge($attachments, sb_email_piping_attachments($part, $inbox, $email_number, $i));
        }
    }
    return $attachments;
}

function sb_email_piping_suffix($conversation_id) {
    return $conversation_id && sb_get_multi_setting('email-piping', 'email-piping-active') ? (' | SB' . $conversation_id . '-' . rand(100, 9999)) : '';
}

function sb_subscribe_email($email) {
    $settings = sb_get_multilingual_setting('emails', 'email-subscribe');
    $subject = $settings['email-subscribe-subject'];
    $content = $settings['email-subscribe-content'];
    sb_reports_update('subscribe');
    if ($settings && !empty($subject) && !empty($content)) {
        return sb_email_send($email, sb_merge_fields($subject), sb_merge_fields($content));
    }
    return false;
}

function sb_email_default_parts($body, $user_id = false) {
    $lang = $user_id ? sb_get_user_language($user_id) : 'en';
    return sb_get_multilingual_setting('emails', 'email-header', $lang) . PHP_EOL . $body . PHP_EOL . sb_get_multilingual_setting('emails', 'email-signature', $lang);
}

function sb_email_attachments_code($attachments) {
    $code = '';
    for ($i = 0; $i < count($attachments); $i++) {
        $code .= '<a style="display:block;text-decoration:none;line-height:25px;color:rgb(102, 102, 102);" href="' . str_replace(' ', '%20', $attachments[$i][1]) . '">' . $attachments[$i][0] . '</a>';
    }
    if ($code) {
        $code = '<div style="margin-top: 30px">' . $code . '</div>';
    }
    return $code;
}

function sb_email_get_conversation_code($conversation_id, $count = false, $is_recipient_agent = false) {
    $conversation_id = sb_db_escape($conversation_id, true);
    $messages = sb_db_get('SELECT A.user_id, A.message, A.payload, A.attachments, A.creation_time, B.first_name, B.last_name, B.profile_image, B.user_type FROM sb_messages A, sb_users B WHERE A.conversation_id = ' . $conversation_id . ' AND A.user_id = B.id ORDER BY A.id ASC', false);
    $count_messages = count($messages);
    $start = $count ? ($count_messages - $count > 0 ? $count_messages - $count : 0) : 0;
    $code = '';
    $count_final = 0;
    $translate = false;
    if (defined('SB_DIALOGFLOW') && sb_get_multi_setting('google', 'google-translation')) {
        $recipient_id = false;
        $sender_id = false;
        for ($i = $count_messages - 1; $i > -1; $i--) {
            if (($is_recipient_agent && sb_is_agent($messages[$i], true)) || (!$is_recipient_agent && !sb_is_agent($messages[$i], true))) {
                $recipient_id = $messages[$i]['user_id'];
                break;
            }
        }
        for ($i = $count_messages - 1; $i > -1; $i--) {
            if (($is_recipient_agent && !sb_is_agent($messages[$i])) || (!$is_recipient_agent && sb_is_agent($messages[$i], true))) {
                $sender_id = $messages[$i]['user_id'];
                break;
            }
        }
        if ($is_recipient_agent && !$recipient_id) {
            $recipient_id = sb_db_get('SELECT id FROM sb_users WHERE user_type = "admin" LIMIT 1')['id'];
        }
        if ($recipient_id && $sender_id) {
            $recipient_language = sb_get_user_language($recipient_id);
            $sender_language = sb_get_user_language($sender_id);
            $translate = $recipient_language && $sender_language && $recipient_language != $sender_language ? $recipient_language : false;
        }
    }
    for ($i = $start; $i < $count_messages; $i++) {
        $message = $messages[$i];
        $message_text = $message['message'];
        $attachments = sb_isset($message, 'attachments', []);
        if (!empty($message_text) || count($attachments)) {
            if ($translate && $message_text) {
                $message = sb_google_get_message_translation($message);
                if ($message['message'] != $message_text) {
                    $message_text = $message['message'];
                } else {
                    $translation = sb_google_translate([$message_text], $translate)[0];
                    if (count($translation)) {
                        $translation = trim($translation[0]);
                        if (!empty($translation)) {
                            $message_text = $translation;
                        }
                    }
                }
            }
            $message_text = sb_rich_messages_to_html($message_text);
            $css = ($is_recipient_agent && sb_is_agent($messages[$i])) || (!$is_recipient_agent && !sb_is_agent($messages[$i])) ? ['right', '0 0 20px 50px', '#E6F2FC'] : ['left', '0 50px 20px 0', '#F0F0F0'];
            $code .= '<div style="float:' . $css[0] . ';text-align:' . $css[0] . ';clear:both;margin:' . $css[1] . ';"><span style="background-color:' . $css[2] . ';padding:10px 15px;display:inline-block;border-radius:4px;margin:0;">' . $message_text . '</span>';
            if ($attachments) {
                $code .= '<br>';
                $attachments = json_decode($attachments, true);
                for ($j = 0; $j < count($attachments); $j++) {
                    $code .= '<br><a style="color:#626262;text-decoration:underline;" href="' . $attachments[$j][1] . '">' . $attachments[$j][0] . '</a>';
                }
            }
            $code .= '<br><span style="color:rgb(168,168,168);font-size:12px;display:block;margin:10px 0 0 0;">' . $message['first_name'] . ' ' . $message['last_name'] . ' | ' . $message['creation_time'] . '</span></div>';
            $count_final++;
        }
    }
    return '<div style="max-width:600px;clear:both;">' . ($start ? '<div style="clear:both;width:100%;opacity:.7;padding-bottom:20px;text-align:left;">' . str_replace('{R}', $count, sb_('Only the most recent {R} messages are shown...')) . '</div>' : '') . $code . '<div style="clear:both;"></div></div>';
}

function sb_remove_email_cron($conversation_id) {
    if (sb_get_setting('notify-email-cron')) {
        if (sb_conversation_security_error($conversation_id)) {
            return sb_error('security-error', 'sb_remove_email_cron');
        }
        $cron_job_emails = sb_get_external_setting('cron-email-notifications', []);
        if (isset($cron_job_emails[$conversation_id])) {
            $is_user_notification = $cron_job_emails[$conversation_id][5];
            if (($is_user_notification && !sb_is_agent()) || (!$is_user_notification && sb_is_agent())) {
                unset($cron_job_emails[$conversation_id]);
                return sb_save_external_setting('cron-email-notifications', $cron_job_emails);
            }
        }
    }
    return false;
}

function sb_text_formatting_to_html($message, $clear = false) {
    $regex = $clear ? [['/\*(.*?)\*/', '', ''], ['/__(.*?)__/', '', ''], ['/~(.*?)~/', '', ''], ['/```(.*?)```/', '', ''], ['/`(.*?)`/', '', '']] : [['/\*(.*?)\*/', '<b>', '</b>'], ['/__(.*?)__/', '<em>', '</em>'], ['/~(.*?)~/', '<del>', '</del>'], ['/```(.*?)```/', '<code>', '</code>'], ['/`(.*?)`/', '<code>', '</code>']];
    for ($i = 0; $i < count($regex); $i++) {
        $values = [];
        if (preg_match_all($regex[$i][0], $message, $values, PREG_SET_ORDER)) {
            for ($j = 0; $j < count($values); $j++) {
                $message = str_replace($values[$j][0], $regex[$i][1] . $values[$j][1] . $regex[$i][2], $message);
            }
        }
    }
    return $message;
}

function sb_clear_text_formatting($message) {
    return sb_text_formatting_to_html($message, true);
}

function sb_newsletter($email, $first_name = '', $last_name = '') {
    $settings = sb_get_setting('newsletter');
    if ($settings && $settings['newsletter-active']) {
        $post_fields = '';
        $header = ['Content-Type: application/json', 'Accept: application/json'];
        $url = false;
        $list_id = $settings['newsletter-list-id'];
        $key = $settings['newsletter-key'];
        $type = 'POST';
        switch ($settings['newsletter-service']) {
            case 'mailchimp':
                $url = 'https://' . substr($key, strpos($key, '-') + 1) . '.api.mailchimp.com/3.0/lists/' . $list_id . '/members/';
                $post_fields = ['email_address' => $email, 'status' => 'subscribed', 'merge_fields' => ['FNAME' => $first_name, 'LNAME' => $last_name]];
                array_push($header, 'Authorization: Basic ' . base64_encode('user:' . $key));
                break;
            case 'sendinblue':
                $url = 'https://api.brevo.com/v3/contacts';
                $post_fields = ['email' => $email, 'listIds' => [intval($list_id)], 'updateEnabled' => false, 'attributes' => ['FIRSTNAME' => $first_name, 'LASTNAME' => $last_name]];
                array_push($header, 'api-key: ' . $key);
                break;
            case 'sendgrid':
                $url = 'https://api.sendgrid.com/v3/marketing/contacts';
                $post_fields = ['list_ids' => [$list_id], 'contacts' => [['email' => $email, 'first_name' => $first_name, 'last_name' => $last_name]]];
                array_push($header, 'Authorization: Bearer ' . $key);
                $type = 'PUT';
                break;
            case 'elasticemail':
                $url = 'https://api.elasticemail.com/v2/contact/add?email=' . $email . '&publicAccountID=' . $key . '&listName=' . urlencode($list_id) . '&firstName=' . urlencode($first_name) . '&lastName=' . urlencode($last_name) . '&sendActivation=false';
                $type = 'GET';
                break;
            case 'campaignmonitor':
                $url = 'https://api.createsend.com/api/v3.2/subscribers/' . $list_id . '.json';
                $post_fields = ['EmailAddress' => $email, 'name' => $first_name . ' ' . $last_name, 'ConsentToTrack' => 'Yes', 'Resubscribe' => true, 'RestartSubscriptionBasedAutoresponders' => true, 'CustomFields' => []];
                array_push($header, 'Authorization: Basic ' . base64_encode($key));
                break;
            case 'hubspot':
                array_push($header, 'Authorization: Bearer ' . $key);
                $contact_id = sb_isset(sb_curl('https://api.hubapi.com/crm/v3/objects/contacts', json_encode(['properties' => ['email' => $email, 'firstname' => $first_name, 'lastname' => $last_name]]), $header), 'id');
                if ($contact_id && $list_id) {
                    $url = 'https://api.hubapi.com/contacts/v1/lists/' . $list_id . '/add';
                    $post_fields = ['vids' => [$contact_id]];
                }
                break;
            case 'moosend':
                $url = 'https://api.moosend.com/v3/subscribers/' . $list_id . '/subscribe.json?apikey=' . $key;
                $post_fields = ['Email' => $email, 'Name' => $first_name . ' ' . $last_name];
                break;
            case 'getresponse':
                $url = 'https://api.getresponse.com/v3/contacts';
                $post_fields = ['email' => $email, 'name' => $first_name . ' ' . $last_name, 'campaign' => ['campaignId' => $list_id]];
                array_push($header, 'X-Auth-Token: api-key ' . $key);
                break;
            case 'convertkit':
                $url = 'https://api.convertkit.com/v3/forms/' . $list_id . '/subscribe';
                $post_fields = ['api_secret' => $key, 'first_name' => $first_name . ' ' . $last_name, 'email' => $email];
                break;
            case 'activecampaign':
                $list_id = explode(':', $list_id);
                array_push($header, 'Api-Token: ' . $key);
                $contact_id = sb_isset(sb_curl('https://' . $list_id[0] . '.api-us1.com/api/3/contacts', json_encode(['contact' => ['email' => $email, 'firstName' => $first_name, 'lastName' => $last_name]]), $header), 'contact');
                if ($contact_id) {
                    $url = 'https://' . $list_id[0] . '.api-us1.com/api/3/contactLists';
                    $post_fields = ['contactList' => ['list' => $list_id[1], 'contact' => $contact_id['id'], 'status' => 1]];
                }
                break;
            case 'mailerlite':
                $url = 'https://api.mailerlite.com/api/v2/groups/' . $list_id . '/subscribers';
                $post_fields = ['email' => $email, 'apiKey' => $key, 'name' => $first_name, 'id' => $list_id, 'fields' => ['last_name' => $last_name]];
                break;
            case 'mailjet':
                $url = 'https://api.mailjet.com/v3/REST/contactslist/' . $list_id . '/managecontact';
                $post_fields = ['Email' => $email, 'Properties' => ['Name' => sb_get_user_name(['first_name' => $first_name, 'last_name' => $last_name])], 'Action' => 'addforce'];
                $key = explode(',', $key);
                array_push($header, 'Authorization: Basic ' . base64_encode(trim($key[0]) . ':' . trim($key[1])));
                break;
            case 'sendy':
                $list_id = explode('|', $list_id);
                $url = $list_id[0] . '/subscribe';
                $header = [];
                $post_fields = ['email' => $email, 'name' => sb_get_user_name(['first_name' => $first_name, 'last_name' => $last_name]), 'list' => $list_id[1], 'api_key' => $key];
                break;
        }
        if ($url) {
            $response = sb_curl($url, empty($header) ? $post_fields : json_encode($post_fields), $header, $type);
            return $response;
        }
    }
    return false;
}

function sb_cron_email_notifications() {
    ignore_user_abort(true);
    set_time_limit(180);
    $emails = sb_get_external_setting('cron-email-notifications');
    $response = [];
    foreach ($emails as $conversation_id => $value) {
        if ($value) {
            $status_code = sb_isset(sb_db_get('SELECT status_code FROM sb_conversations WHERE id = ' . sb_db_escape($conversation_id, true)), 'status_code');
            if ((($value[5] && $status_code == 2) || (!$value[5] && $status_code == 1)) && ($value[0] == 'agents' || $value[0] == 'all-agents' || strpos($value[0], 'department-') !== false || sb_is_agent(is_numeric($value[0]) ? sb_get_user($value[0]) : $value[0], true)) != sb_is_agent(sb_db_get('SELECT user_type FROM sb_messages, sb_users WHERE conversation_id = ' . sb_db_escape($conversation_id, true) . ' AND sb_users.id = user_id ORDER BY sb_messages.id DESC LIMIT 1'), true)) {
                $GLOBALS['SB_FORCE_ADMIN'] = true;
                $response = sb_email_create($value[0], $value[1], $value[2], sb_email_get_conversation_code($conversation_id, 5, $value[5]), $value[3], $value[4], $conversation_id);
                $GLOBALS['SB_FORCE_ADMIN'] = false;
            } else {
                $response = true;
            }
            if ($response === true) {
                $emails[$conversation_id] = false;
                sb_save_external_setting('cron-email-notifications', $emails);
            }
        }
    }
    $emails = sb_get_external_setting('cron-email-notifications');
    $emails_to_save = [];
    foreach ($emails as $conversation_id => $value) {
        if ($value) {
            $emails_to_save[$conversation_id] = $value;
        }
    }
    sb_save_external_setting('cron-email-notifications', $emails_to_save);
    return true;
}

function sb_rich_messages_to_html($message) {
    $shortcode = sb_get_shortcode($message);
    $extra_values = [];
    $div_button_start = '<div>';
    $div_button = '<div style="background-color:#028BE5;color:#FFF;border-radius:4px;padding:3px 6px;float:left;margin-right:5px;cursor:default">';
    $div_button_end = '<div style="width:100%;clear:both"></div></div>';
    $div_input = '<div style="margin-top:5px;border:1px solid #999999;background:#FFF;color:#c2c2c2;font-size:13px;line-height:14px;border-radius:4px;padding:6px 10px;cursor:text;">';
    if ($shortcode) {
        $shortcode_name = $shortcode['shortcode_name'];
        $message = trim(str_replace($shortcode['shortcode'], '', $message) . (empty($shortcode['title']) ? '' : '<b>' . sb_($shortcode['title']) . '</b><br>') . sb_isset($shortcode, 'message', ''));
        if ($message) {
            $message .= '<br><br>';
        }
        if ($shortcode_name == 'registration' || $shortcode_name == 'timetable') {
            $message .= '[' . $shortcode_name . ']';
        }
        switch ($shortcode_name) {
            case 'slider-images':
                $message .= $div_button_start;
                $extra_values = explode(',', $shortcode['images']);
                for ($i = 0; $i < count($extra_values); $i++) {
                    $message .= '<img src="' . $extra_values[$i] . '" style="float:left;width:20%;min-width:100px;" />';
                }
                $message .= $div_button_end;
                break;
            case 'slider':
            case 'card':
                $suffix = '';
                if ($shortcode_name == 'slider') {
                    $suffix = '-1';
                }
                $message .= '<div style="width:300px;margin:-10px -15px;border-radius:4px;overflow:hidden;"><img style="max-width:100%" src="' . $shortcode['image' . $suffix] . '" /><div style="padding:15px"><b>' . sb_($shortcode['header' . $suffix]) . '</b><br>' . (empty($shortcode['description' . $suffix]) ? '' : '<div style="padding-top:5px">' . $shortcode['description' . $suffix] . '</div>') . (empty($shortcode['extra' . $suffix]) ? '' : '<div style="padding-top:5px">' . $shortcode['extra' . $suffix] . '</div>') . (empty($shortcode['link-text' . $suffix]) ? '' : '<br>' . $div_button . $shortcode['link-text' . $suffix] . '</div>') . $div_button_end . '</div>';
                break;
            case 'select':
            case 'buttons':
            case 'chips':
                $values = explode(',', $shortcode['options']);
                $message .= $div_button_start;
                for ($i = 0; $i < count($values); $i++) {
                    $message .= $div_button . $values[$i] . '</div>';
                }
                $message .= $div_button_end;
                break;
            case 'inputs':
                $values = explode(',', $shortcode['values']);
                for ($i = 0; $i < count($values); $i++) {
                    $message .= $div_input . $values[$i] . '</div>';
                }
                break;
            case 'email':
                $fields = ['placeholder', 'name', 'last-name', 'phone'];
                for ($i = 0; $i < count($fields); $i++) {
                    $field = $shortcode[$fields[$i]];
                    $is_true = $field == 'true' || $field === true;
                    if ($is_true || ($field != 'false' && $field !== false)) {
                        $message .= $div_input . ($is_true ? sb_string_slug($fields[$i], 'string') : $field) . '</div>';
                    }
                }
                break;
            case 'button':
                $message .= $div_button_start . $div_button . $shortcode['link'] . '</div>' . $div_button_end;
                break;
            case 'video':
                $message .= ($shortcode['type'] == 'youtube' ? 'https://www.youtube.com/embed/' : 'https://player.vimeo.com/video/') . $shortcode['id'];
                break;
            case 'image':
                $message .= '<img src="' . $shortcode['url'] . '" style="max-width:300px;border-radius:4px;margin:-10px -15px;display:block;" />';
                break;
            case 'list-image':
            case 'list':
                $index = 0;
                $is_list_image = $shortcode_name == 'list-image';
                if ($is_list_image) {
                    $shortcode['values'] = str_replace('://', '//', $shortcode['values']);
                    $index = 1;
                }
                $values = explode(',', $shortcode['values']);
                if (strpos($values[0], ':')) {
                    for ($i = 0; $i < count($values); $i++) {
                        $value = explode(':', $values[$i]);
                        $message .= '<br>' . '• ' . ($is_list_image ? '<img style="border-radius:4px;width:30px;height:30px;transform:translateY(10px);margin-right: 10px;" src="' . str_replace('//', '://', $value[0]) . '" />' : '') . '*' . trim($value[$index]) . '* ' . trim($value[$index + 1]);
                    }
                } else {
                    for ($i = 0; $i < count($values); $i++) {
                        $message .= '<br>' . '• ' . trim($values[$i]);
                    }
                }
                $message = trim(substr($message, 4));
                break;
            case 'rating':
                $message .= $div_button_start . $div_button . sb_($shortcode['label-positive']) . '</div>' . $div_button . sb_($shortcode['label-negative']) . '</div>' . $div_button_end;
                break;
            case 'articles':
                $message .= '<b>' . sb_(sb_get_setting('articles-title', 'Help center')) . '</b><br>' . sb_isset($shortcode, 'link');
                break;
        }
    }
    return sb_text_formatting_to_html($message);
}

?>
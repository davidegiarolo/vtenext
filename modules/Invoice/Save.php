<?php
/*************************************
 * SPDX-FileCopyrightText: 2009-2020 Vtenext S.r.l. <info@vtenext.com> 
 * SPDX-License-Identifier: AGPL-3.0-only  
 ************************************/

require_once('modules/Invoice/Invoice.php');
require_once('include/logging.php');
require_once('include/database/PearDatabase.php');
include_once("modules/Emails/mail.php");

$local_log =& LoggerManager::getLogger('index');

$focus = CRMEntity::getInstance('Invoice');
//added to fix 4600
$search=vtlib_purify($_REQUEST['search_url']);

global $current_user, $currentModule;
setObjectValuesFromRequest($focus);

$focus->column_fields['currency_id'] = $_REQUEST['inventory_currency'];
$cur_sym_rate = getCurrencySymbolandCRate($_REQUEST['inventory_currency']);
$focus->column_fields['conversion_rate'] = $cur_sym_rate['rate'];

if($_REQUEST['assigntype'] == 'U')  {
	$focus->column_fields['assigned_user_id'] = $_REQUEST['assigned_user_id'];
} elseif($_REQUEST['assigntype'] == 'T') {
	$focus->column_fields['assigned_user_id'] = $_REQUEST['assigned_group_id'];
}
$focus->save("Invoice");

$return_id = $focus->id;

$parenttab = getParentTab();
if(isset($_REQUEST['return_module']) && $_REQUEST['return_module'] != "") $return_module = vtlib_purify($_REQUEST['return_module']);
else $return_module = "Invoice";
if(isset($_REQUEST['return_action']) && $_REQUEST['return_action'] != "") $return_action = vtlib_purify($_REQUEST['return_action']);
else $return_action = "DetailView";
if(isset($_REQUEST['return_id']) && $_REQUEST['return_id'] != "") $return_id = vtlib_purify($_REQUEST['return_id']);

$local_log->debug("Saved record with id of ".$return_id);

//code added for returning back to the current view after edit from list view
if($_REQUEST['return_viewname'] == '') $return_viewname='0';
if($_REQUEST['return_viewname'] != '')$return_viewname=vtlib_purify($_REQUEST['return_viewname']);

//crmv@54375
if($_REQUEST['return2detail'] == 'yes') {
	$return_module = $currentModule;
	$return_action = 'DetailView';
	$return_id = $focus->id;
}
//crmv@54375e

$url = "index.php?action=$return_action&module=$return_module&parenttab=$parenttab&record=$return_id&viewname=$return_viewname&start=".vtlib_purify($_REQUEST['pagenumber']).$search;

$from_module = vtlib_purify($_REQUEST['module']);
if (!empty($from_module)) $url .= "&from_module=$from_module";

RequestHandler::outputRedirect($url); // crmv@150748
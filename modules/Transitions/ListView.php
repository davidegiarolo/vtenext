<?php
/*************************************
 * SPDX-FileCopyrightText: 2009-2020 Vtenext S.r.l. <info@vtenext.com> 
 * SPDX-License-Identifier: AGPL-3.0-only  
 ************************************/
global $app_strings;
global $currentModule, $current_user,$current_language;
global $table_prefix;
require_once("modules/$currentModule/$currentModule.php");

if($current_user->is_admin != 'on')
{
        die("<br><br><center>".$app_strings['LBL_PERMISSION']." <a href='javascript:window.history.back()'>".$app_strings['LBL_GO_BACK'].".</a></center>");
}

$log = LoggerManager::getLogger($currentModule); //@todo - decidere il nome

$theme_path="themes/".$theme."/";
$image_path=$theme_path."images/";
$mod_strings = return_module_language($current_language, $currentModule);
$category = getParentTab();
$modules_list = com_vtGetModules($adb);
$StDataRemapped = Array();	
$StDataRemapped['ModuleName'] = $_REQUEST["module"];

$smarty = new VteSmarty();
$check_button = Button_Check($module);
$check_button['moduleSettings'] = 'no'; // crmv@140887
$smarty->assign("CHECK", $check_button);
$smarty->assign("CURRENT_USERID", $current_user->id);
$smarty->assign("IMAGE_PATH",$image_path);
$smarty->assign("CATEGORY",$category);
$smarty->assign("USER_COUNT",$no_of_users);
$smarty->assign("ST_PIECE_DATA",$StDataRemapped);
$smarty->assign("modules_list", $modules_list);
$settings_strings = return_module_language($current_language,'Settings');
$smarty->assign("SMOD", $settings_strings);
$smarty->assign("TMOD", return_module_language($current_language,'Transitions'));
$smarty->assign("APP", $app_strings);
$smarty->assign("THEME", $theme);
$roleDetails=getAllRoleDetails();
$allRolesDetails = getAllRoleDetails(); //crmv@191067
//$grpDetails=getAllGroupName();
unset($roleDetails['H1']);
$role_check_picklist ='<select id="role_check" name="role_check" onChange="role_selection_change();" style="width: 200px;">';
$src_role_check_picklist = '<select id="src_role_check" name="src_role_check" style="width: 200px;">';
$role_check_picklist .='<option value="-1'.$roleid.'">'.$app_strings['LBL_NONE'].'</option>';
$src_role_check_picklist .='<option value="-1'.$roleid.'">'.$app_strings['LBL_NONE'].'</option>';
foreach($roleDetails as $roleid=>$rolename)
{
	$role_check_picklist .='<option value="'.$roleid.'">'.$settings_strings['LBL_ROLES'].'::'.$rolename[0].'</option>'; // crmv@167234
	$src_role_check_picklist .='<option value="'.$roleid.'">'.$settings_strings['LBL_ROLES'].'::'.$rolename[0].'</option>'; // crmv@167234
}
//foreach($roleDetails as $roleid=>$rolename)
//{
//	$role_check_picklist .='<option value="rs::'.$roleid.'">'.$mod_strings[LBL_ROLES_SUBORDINATES].'::'.$rolename[0].'</option>';
//	$src_role_check_picklist .='<option value="rs::'.$roleid.'">'.$mod_strings[LBL_ROLES_SUBORDINATES].'::'.$rolename[0].'</option>';
//}

//foreach($grpDetails as $groupid=>$groupname)
//{
//	$role_check_picklist .='<option value="groups::'.$groupid.'">'.$mod_strings[LBL_GROUP].'::'.$groupname.'</option>';
//	$src_role_check_picklist .='<option value="groups::'.$groupid.'">'.$mod_strings[LBL_GROUP].'::'.$groupname.'</option>';
//}
$role_check_picklist .= '</select>';
$src_role_check_picklist .= '</select>';

$smarty->assign("ROLE_CHECK_PICKLIST",$role_check_picklist);
$smarty->assign("COPY_ROLE_CHECK_PICKLIST",$src_role_check_picklist);

if($_REQUEST['ajax'] !='' && $_REQUEST['module_name'] && $_REQUEST['field'] != "" && $_REQUEST['roleid'] != "") {
	$obj = CRMEntity::getInstance($currentModule);
	$obj->Initialize($_REQUEST['module_name'],$_REQUEST['roleid'],$_REQUEST['field']);
	$smarty->assign("st_table",$obj->getStTable($state_num));
	$td_width = intval(100/($state_num+1));
	$smarty->assign("st_table_td_width",$td_width);	
	$fieldinfo = $obj->getFieldStateInfo();
	$fieldinfodata = call_user_func_array('getOutputHtml',$fieldinfo);
	$fieldinfodata[] = 1;	//crmv@45812	TODO set real fieldid
	$fieldinfodata[1][0] = $mod_strings['LBL_INITIAL_STATE'];	//crmv@16604
	$data['Stato iniziale'][0]=$fieldinfodata;
	$data['Stato iniziale'][1]=array('0'=>array(1),'4'=>'99');	//crmv@16604
	$smarty->assign("data",$data);	
	$smarty->assign("MODULE",$_REQUEST['module_name']);	
	$smarty->assign("MOD", return_module_language($current_language,$_REQUEST['module_name']));
}

// crmv@191067
$arr = [];
$sql = "select field, initial_value, roleid, module from tbl_s_transitions_init_fields t1 where field=(select t2.field from tbl_s_transitions_fields t2 where t2.module=t1.module)";
$res = $adb->pquery($sql, array());
$noofrows = $adb->num_rows($res);
for($j = 0; $j < $noofrows; $j++)
{
	$roleid = $adb->query_result($res, $j, 'roleid');
	$module = $adb->query_result($res, $j, 'module');
	$field = $adb->query_result($res, $j, 'field');

	$sql2 = "select fieldlabel from {$table_prefix}_field where fieldname= ? and tabid= ?";
	$res2 = $adb->pquery($sql2, array($field, getTabId($module)));
	$fieldlabel = $adb->query_result($res2, 0, 'fieldlabel');
	$arr[] = [
		'field'=>$field,
		'initial_value'=>$adb->query_result($res, $j, 'initial_value'),
		'role'=>$allRolesDetails[$roleid][0],
		'roleid'=>$roleid,
		'module'=>$module,
		'fieldlabel'=>$fieldlabel,
	];
}
$smarty->assign('TRANS_LIST_DATA', $arr);
$smarty->assign('TRANS_LIST_DATA_COUNT', count($arr));

// crmv@191067e

if($_REQUEST['ajax'] !='') 
	$smarty->display("modules/$currentModule/ListViewContents.tpl");
else
	$smarty->display("modules/$currentModule/ListView.tpl");
 
?>
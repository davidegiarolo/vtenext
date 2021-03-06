{*
/*************************************
 * SPDX-FileCopyrightText: 2009-2020 Vtenext S.r.l. <info@vtenext.com> 
  * SPDX-License-Identifier: AGPL-3.0-only  
 ************************************/
*}
{include file='Buttons_List1.tpl'} {* crmv@187110 *}
<script language="JavaScript" type="text/javascript" src="modules/Import/resources/Import.js"></script>

<form onsubmit="VteJS_DialogBox.block();" action="index.php" enctype="multipart/form-data" method="POST" name="importAdvanced">
	<input type="hidden" name="__csrf_token" value="{$CSRF_TOKEN}"> {* crmv@171581 *}
	<input type="hidden" name="module" value="{$FOR_MODULE}" />
	<input type="hidden" name="action" value="Import" />
	<input type="hidden" name="mode" value="import" />
	<input type="hidden" name="type" value="{$USER_INPUT->getString('type')}" />
	<input type="hidden" name="has_header" value='{$HAS_HEADER}' />
	<input type="hidden" name="file_encoding" value='{$USER_INPUT->getString('file_encoding')}' />
	<input type="hidden" name="delimiter" value='{$USER_INPUT->getString('delimiter')}' />
	<input type="hidden" name="merge_type" value='{$USER_INPUT->getString('merge_type')}' />
	<input type="hidden" name="merge_fields" value='{$USER_INPUT->getString('merge_fields')}' />

	<input type="hidden" id="mandatory_fields" name="mandatory_fields" value='{$ENCODED_MANDATORY_FIELDS}' />

	<table style="width:80%;margin-left:auto;margin-right:auto;margin-top:10px;" cellpadding="5" cellspacing="12" class="searchUIBasic">
		<tr>
			<td class="heading2" align="left" colspan="2">
				{'LBL_IMPORT'|@getTranslatedString:$MODULE} {$FOR_MODULE|@getTranslatedString:$FOR_MODULE}
			</td>
		</tr>
		{if $ERROR_MESSAGE neq ''}
		<tr>
			<td class="style1" align="left" colspan="2">
				{$ERROR_MESSAGE}
			</td>
		</tr>
		{/if}
		<tr>
			<td class="leftFormBorder1" colspan="2" valign="top">
			{include file='modules/Import/Import_Step4.tpl'}
			</td>
		</tr>
		<tr>
			<td align="right" colspan="2">
			{include file='modules/Import/Import_Advanced_Buttons.tpl'}
			</td>
		</tr>
	</table>
</form>
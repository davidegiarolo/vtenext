<?php
/*************************************
 * SPDX-FileCopyrightText: 2009-2020 Vtenext S.r.l. <info@vtenext.com> 
 * SPDX-License-Identifier: AGPL-3.0-only  
 ************************************/

/* crmv@197423 */

namespace VteSyncLib\Connector\Vtiger\Model;

class Contacts extends GenericVtigerRecord {

	protected static $staticModule = 'Contacts';
	
	protected static $fieldMap = array(
		// Vtiger => CommonRecord
		'salutationtype' => 'salutationtype',
		'lastname' => 'lastname',
		'firstname' => 'firstname',
		'account_id' => 'accountid',
		'phone' => 'phone',
		'fax' => 'fax',
		'mobile' => 'mobile',
		'homephone' => 'homephone',
		'otherphone' => 'otherphone',
		'assistantphone' => 'assistantphone',
		'email' => 'email',
		'title' => 'title',
		'department' => 'department',
		'assistant' => 'assistant',
		'birthday' => 'birthday',
		'leadsource' => 'leadsource',
		'description' => 'description',
		
		// mailing address
		'mailingstreet' => 'mailingstreet',
		'mailingcity' => 'mailingcity',
		'mailingpobox' => 'mailingpostalcode',
		'mailingstate' => 'mailingstate',
		'mailingcountry' => 'mailingcountry',
		// other address
		'otherstreet' => 'otherstreet',
		'othercity' => 'othercity',
		'otherpostalcode' => 'otherpostalcode',
		'otherstate' => 'otherstate',
		'othercountry' => 'othercountry',
	);
	public static function extractId($data) {
		
		return $data['id'];
	}
	
	public static function extractOwner($data) {
		return $data['assigned_user_id'];
		
	}

	public static function extractCreatedTime($data) {
		$cDate = $data['createdtime'];
		$cDate = strtotime($cDate);
		$creationTime = new \DateTime();
		$creationTime->format('U = Y-m-d H:i:s.u');
		$creationTime->setTimestamp($cDate);
		return $creationTime;
	}
	
	public static function extractModifiedTime($data) {
		$date_data = $data['modifiedtime'];
		$date_data = strtotime($date_data);
		$modTime = new \DateTime();
		$modTime->format('U = Y-m-d H:i:s.u');
		$modTime->setTimestamp($date_data);
		return $modTime;
	}
	
	public static function extractEtag($data) {
		$lastmod = static::extractModifiedTime($data);
		$etag = strval($lastmod->getTimestamp().$lastmod->format('u'));
		return $etag;
	}
	
	public static function fromRawData($data) {
		
		$id = static::extractId($data);
		$ownerid = static::extractOwner($data);
	
		$creatTime = static::extractCreatedTime($data);
		$modTime = static::extractModifiedTime($data);
		$etag = static::extractEtag($data);	
		
		$owner = explode('x',$ownerid);
		
				
		$fields = array_intersect_key($data, static::$fieldMap);
		
		
		$record = new static(static::$staticModule, $id, $etag, $fields);
		//crmv@197423
		if($data["email"] == NULL)
		{
			$record->fields["email"] = $data["secondaryemail"];	
		}	
		//crmv@197423e
		$record->owner = $owner[1];
		$record->rawData = $data;
		$record->createdTime = $creatTime;
		$record->modifiedTime = $modTime;
		
		return $record;
	}
	
	// if needed, you can override methods and change fields/behaviour
}


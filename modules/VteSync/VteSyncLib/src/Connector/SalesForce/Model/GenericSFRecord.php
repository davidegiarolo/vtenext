<?php
/*************************************
 * SPDX-FileCopyrightText: 2009-2020 Vtenext S.r.l. <info@vtenext.com> 
 * SPDX-License-Identifier: AGPL-3.0-only  
 ************************************/

namespace VteSyncLib\Connector\SalesForce\Model;

use VteSyncLib\Model\GenericRecord;
use VteSyncLib\Model\CommonRecord;

class GenericSFRecord extends GenericRecord {

	protected static $connector = 'SalesForce';
	
	public static function extractId($data) {
		return $data['Id'];
	}
	
	public static function extractOwner($data) {
		return $data['OwnerId'];
	}
	
	public static function extractCreatedTime($data) {
		return new \DateTime($data['CreatedDate']);
	}
	
	public static function extractModifiedTime($data) {
		return new \DateTime($data['LastModifiedDate']);
	}
	
	public static function extractEtag($data) {
		$lastmod = static::extractModifiedTime($data);
		$etag = strval($lastmod->getTimestamp().$lastmod->format('u'));
		return $etag;
	}
}
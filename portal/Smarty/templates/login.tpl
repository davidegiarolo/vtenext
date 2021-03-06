{*+*************************************************************************************
{*************************************
 * SPDX-FileCopyrightText: 2009-2020 Vtenext S.r.l. <info@vtenext.com> 
 * SPDX-License-Identifier: AGPL-3.0-only  
 ************************************}
{* crmv@167855 *}
{include file="htmlheader.tpl"} {* crmv@168297 *}
<body>
{* crmv@174227 - remove bootstrap lib, already included *}

	<div id="page-wrapper">
		<div class="container-fluid">
			
			<form name="login" action="CustomerAuthenticate.php" method="POST"> {* crmv@127527 *}
			<input type="hidden" name="__csrf_token" value="{$CSRF_TOKEN}"> <!--  crmv@171581 -->
				<div class="row">
					<div class="col-xs-12 col-centered" id="logo">
						<div class="row row-centered">
							<img class="img-responsive col-centered" id="imagelogin" src="{'login'|get_logo}">
						</div>
					</div>
				</div>

				<div class="row">
					<div class="container">
						{if $LOGIN_ERROR != ""}
							<div class="alert alert-danger alert-dismissable" style="margin-top:10px; margin-bottom:10px">
 								 <button type="button" class="close" data-dismiss="alert">&times; </button>
 								{$LOGIN_ERROR|getTranslatedString}
							</div>
						{/if}
					</div>
				</div>
					
					<div class="row form-login">
						<div class="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
							<div id="form-input">
								<input type="text" class="form-control" size="37" name="username" id="username" value="" placeholder="{'LBL_EMAILID'|getTranslatedString}" tabindex="1" autocorrect="off" autocapitalize="off"> 
								<input type="password" class="form-control" size="37" name="pw" id="pw" value="" placeholder="{'LBL_PASSWORD'|getTranslatedString}" tabindex="2">
							</div>
							<div class="logintxt">
								<!-- crmv@remember_me -->
								<div class="row-action-primary checkbox col-md-6 col-md-offset-3 text-center">
                                	<label>
										<input type="checkbox" class="small" name="savelogin" id="savelogin" tabindex="3" style="border: 0;">
										<span class="checkbox-material"><span class="check"></span></span>
										<span style="font-size:13px;">{'LBL_KEEP_ME_LOGGED_IN'|getTranslatedString}</span>
									</label>
                                 </div>
								<!-- crmv@remember_me e -->
								<div class="col-md-6 col-md-offset-3 text-center" style="margin-top: 20px; margin-bottom: 20px;">
									<a data-toggle="modal" data-target=".bs-example-modal-sm" href="#">{'LBL_FORGOT_LOGIN'|getTranslatedString}</a>
								</div>

								<div class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
  									<div class="modal-dialog modal-sm modal-xs">
    									<div class="modal-content">
     										<iframe  class="embed-responsive-item" style="width: 100%; min-height: 250px" src="supportpage.php?param=forgot_password&login_language={$LOGINLANGUAGE}"></iframe>
   										 </div>
  									</div>
								</div>
							</div>

							<div class="logintxt">
								<div class="row row-centered">
									<div class="col-md-6 col-sm-6 col-xs-12" id="language_id" style="margin: 10px 0;">
										<center><select class="form-control" name="login_language" onChange="window.location.href='login.php?login_language='+this.value" style="max-width:60%"></center>
											{$LANGUAGE}
										</select>
									</div>
									<div class="col-md-6 col-sm-6 col-xs-12">
										<input title="Login [Alt+L]" class="btn btn-primary" alt="Login" accesskey="L" type="submit" class="loginsubmit" name="Login" value="Log In" tabindex="4">
									</div>
								</div>
							</div>
						</div>
					</div>	<!-- form-login -->	
				</div>	<!-- container -->	
			</form>
		</div>	<!-- container-fluid -->
	</div>
</body>
</html>
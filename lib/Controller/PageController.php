<?php
/**
 * BlockScores
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <blockscores@scherello.de>
 * @copyright 2018 Marcel Scherello
 */

namespace OCA\BlockScores\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;

class PageController extends Controller {
	private $userId;

	public function __construct($AppName, IRequest $request, $UserId){
		parent::__construct($AppName, $request);
		$this->userId = $UserId;
	}

	/**
	 * CAUTION: the @Stuff turns off security checks; for this page no admin is
	 *          required and no CSRF check. If you don't know what CSRF is, read
	 *          it up in the docs or you might create a security hole. This is
	 *          basically the only required method to add this exemption, don't
	 *          add it to any other method if you don't exactly know what it does
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {

        $csp = new \OCP\AppFramework\Http\ContentSecurityPolicy();
        $csp->addAllowedMediaDomain('*');
        $csp->addAllowedFrameDomain('*');
        $csp->addAllowedScriptDomain('\'unsafe-inline\'');
        $csp->addAllowedScriptDomain('*');
        $csp->addAllowedConnectDomain('*');
        $csp->addAllowedObjectDomain('*');
        $csp->addAllowedChildSrcDomain('*');

        $response =  new TemplateResponse('blockscores', 'index');  // templates/index.php
        $response->setContentSecurityPolicy($csp);
        return $response;

    }

}

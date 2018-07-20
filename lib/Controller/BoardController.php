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

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCP\IL10N;
use OCP\ILogger;

/**
 * Controller class for main page.
 */
class BoardController extends Controller
{

    private $userId;
    private $l10n;
    private $logger;
    private $DBController;

    public function __construct(
        $appName,
        IRequest $request,
        $userId,
        IL10N $l10n,
        ILogger $logger,
        DbController $DBController
    )
    {
        parent::__construct($appName, $request);
        $this->userId = $userId;
        $this->l10n = $l10n;
        $this->logger = $logger;
        $this->DBController = $DBController;
    }

    /**
     * @NoAdminRequired
     *
     */
    public function getBoards()
    {
        $boards = $this->DBController->readBoardsFromDb();

        $result = empty($boards) ? [
            'status' => 'nodata'
        ] : [
            'status' => 'success',
            'data' => $boards
        ];
        $response = new JSONResponse();
        $response->setData($result);
        return $response;
    }

    /**
     * @NoAdminRequired
     * @param $boardName
     * @param $boardHash
     * @return JSONResponse
     */
    public function addBoard($boardName, $boardHash)
    {
        if ($this->DBController->writeBoardToDb($boardName, $boardHash)) {
            $result = [
                'status' => 'success',
            ];
        } else {
            $result = [
                'status' => 'already existing',
            ];
        }

        $response = new JSONResponse();
        $response->setData($result);
        return $response;
    }

    /**
     * @NoAdminRequired
     * @param $boardHash
     * @return JSONResponse
     */
    public function deleteBoard($boardHash)
    {
        if ($this->DBController->deleteFromDB($boardHash)) {
            $result = [
                'status' => 'success',
            ];
        } else {
            $result = [
                'status' => 'error',
            ];
        }

        $response = new JSONResponse();
        $response->setData($result);
        return $response;
    }

}
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
use OCP\IRequest;
use OCP\IL10N;
use OCP\IDbConnection;
use OCP\ILogger;

/**
 * Controller class for main page.
 */
class DbController extends Controller
{

    private $userId;
    private $l10n;
    private $db;
    private $logger;

    public function __construct(
        $appName,
        IRequest $request,
        $userId,
        IL10N $l10n,
        IDbConnection $db,
        ILogger $logger
    )
    {
        parent::__construct($appName, $request);
        $this->userId = $userId;
        $this->l10n = $l10n;
        $this->db = $db;
        $this->logger = $logger;
    }

    /**
     * Delete board from tables
     * @param int $boardHash
     * @return bool
     */
    public function deleteFromDB($boardHash)
    {
        $this->logger->debug('deleteFromDB: ' . $boardHash, array('app' => 'blockscores'));

        $stmt = $this->db->prepare('DELETE FROM `*PREFIX*blockscores_boards` WHERE  `hash` = ? AND `user_id` = ?');
        $stmt->execute(array($boardHash, $this->userId));
        return true;
    }

    /**
     * Add Board to DB if not exist
     * @param string $boardName
     * @param string $boardHash
     * @return bool
     */
    public function writeBoardToDb($boardName, $boardHash)
    {
        if ($this->db->insertIfNotExist('*PREFIX*blockscores_boards', ['user_id' => $this->userId, 'name' => $boardName, 'hash' => $boardHash])) {
            return true;
        } else {
            return false;
        }
    }


    /**
     * Get Boards for User
     * @return array
     */
    public function readBoardsFromDb()
    {
        $SQL = "SELECT  `name` , `hash`
						FROM `*PREFIX*blockscores_boards` `AP`
			 			WHERE  `user_id` = ?
			 			ORDER BY LOWER(`name`) ASC
			 			";
        $stmt = $this->db->prepare($SQL);
        $stmt->execute(array($this->userId));
        $results = $stmt->fetchAll();
        return $results;
    }

    /**
     * truncates fiels do DB-field size
     *
     * @param $string
     * @param $length
     * @param $dots
     * @return string
     */
    private function truncate($string, $length, $dots = "...")
    {
        return (strlen($string) > $length) ? mb_strcut($string, 0, $length - strlen($dots)) . $dots : $string;
    }

    /**
     * validate unsigned int values
     *
     * @param string $value
     * @return int value
     */
    private function normalizeInteger($value)
    {
        // convert format '1/10' to '1' and '-1' to null
        $tmp = explode('/', $value);
        $tmp = explode('-', $tmp[0]);
        $value = $tmp[0];
        if (is_numeric($value) && ((int)$value) > 0) {
            $value = (int)$value;
        } else {
            $value = 0;
        }
        return $value;
    }

}

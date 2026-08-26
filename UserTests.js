/**
 * ============================================================
 * USERS API — FULL TEST
 * ============================================================
 *
 * Full lifecycle test:
 *
 * CREATE
 *   ↓
 * FIND BY PILGRIM NUMBER
 *   ↓
 * GET BY USER ID
 *   ↓
 * UPDATE
 *   ↓
 * VERIFY UPDATE
 *   ↓
 * FIND AGAIN
 *   ↓
 * DELETE
 *   ↓
 * VERIFY DELETED
 *
 * Run:
 *
 *   runUsersTest()
 *
 * ============================================================
 */

function runUsersTest() {

  const startedAt = new Date();

  console.log('====================================');
  console.log('USERS API TEST');
  console.log('====================================');


  /*
   * Generate unique test data.
   */

  const uniqueId =
    Date.now().toString();


  const testUser = {

    pilgrimNumber:
      'TEST-' + uniqueId,

    fullName:
      'Test User ' + uniqueId,

    groupId:
      'TEST-GROUP'
  };


  let userId = null;

  let createdRow = null;


  try {

    /*
     * ========================================================
     * 1. CREATE USER
     * ========================================================
     */

    console.log(
      '1. CREATE USER'
    );


    const createResult =
      UsersService.createUser(
        testUser
      );


    assertNotNull(
      createResult,
      'Create result is null'
    );


    assertNotNull(
      createResult.user,
      'Created user is missing'
    );


    assertNotNull(
      createResult.user.UserId,
      'UserId was not generated'
    );


    userId =
      createResult.user.UserId;


    createdRow =
      createResult.row;


    assertEqual(
      createResult.user.PilgrimNumber,
      testUser.pilgrimNumber
    );


    assertEqual(
      createResult.user.FullName,
      testUser.fullName
    );


    assertEqual(
      createResult.user.GroupId,
      testUser.groupId
    );


    assertEqual(
      createResult.user.Status,
      'active'
    );


    assertNotNull(
      createResult.user.CreatedAt
    );


    assertNotNull(
      createResult.user.UpdatedAt
    );


    console.log(
      'PASS: User created'
    );


    console.log(
      'UserId: ' +
      userId
    );


    /*
     * ========================================================
     * 2. FIND USER BY PILGRIM NUMBER
     * ========================================================
     */

    console.log(
      '2. FIND USER BY PILGRIM NUMBER'
    );


    const findResult =
      UsersService.findUser({

        pilgrimNumber:
          testUser.pilgrimNumber

      });


    assertTrue(
      findResult.found,
      'User should be found'
    );


    assertNotNull(
      findResult.user,
      'Found user is missing'
    );


    assertEqual(
      findResult.user.UserId,
      userId,
      'Found wrong UserId'
    );


    assertEqual(
      findResult.user.PilgrimNumber,
      testUser.pilgrimNumber
    );


    assertEqual(
      findResult.user.FullName,
      testUser.fullName
    );


    assertEqual(
      findResult.user.GroupId,
      testUser.groupId
    );


    assertEqual(
      findResult.row,
      createdRow,
      'Wrong row returned'
    );


    console.log(
      'PASS: User found by pilgrim number'
    );


    /*
     * ========================================================
     * 3. GET USER BY USER ID
     * ========================================================
     */

    console.log(
      '3. GET USER BY USER ID'
    );


    const getResult =
      UsersService.getUser({

        userId:
          userId

      });


    assertNotNull(
      getResult,
      'Get result is null'
    );


    assertEqual(
      getResult.row,
      createdRow
    );


    assertNotNull(
      getResult.user,
      'User is missing'
    );


    assertEqual(
      getResult.user.UserId,
      userId
    );


    assertEqual(
      getResult.user.PilgrimNumber,
      testUser.pilgrimNumber
    );


    console.log(
      'PASS: User retrieved by UserId'
    );


    /*
     * ========================================================
     * 4. UPDATE USER
     * ========================================================
     */

    console.log(
      '4. UPDATE USER'
    );


    const updatedName =
      'Updated User ' +
      uniqueId;


    const updatedGroup =
      'UPDATED-GROUP';


    const updateResult =
      UsersService.updateUser({

        userId:
          userId,

        fullName:
          updatedName,

        groupId:
          updatedGroup,

        status:
          'active'

      });


    assertNotNull(
      updateResult,
      'Update result is null'
    );


    assertEqual(
      updateResult.row,
      createdRow
    );


    assertEqual(
      updateResult.user.UserId,
      userId
    );


    assertEqual(
      updateResult.user.FullName,
      updatedName
    );


    assertEqual(
      updateResult.user.GroupId,
      updatedGroup
    );


    assertNotNull(
      updateResult.user.UpdatedAt
    );


    console.log(
      'PASS: User updated'
    );


    /*
     * ========================================================
     * 5. VERIFY UPDATE
     * ========================================================
     */

    console.log(
      '5. VERIFY UPDATED USER'
    );


    const verifyResult =
      UsersService.getUser({

        userId:
          userId

      });


    assertEqual(
      verifyResult.user.UserId,
      userId
    );


    assertEqual(
      verifyResult.user.FullName,
      updatedName
    );


    assertEqual(
      verifyResult.user.GroupId,
      updatedGroup
    );


    assertEqual(
      verifyResult.user.Status,
      'active'
    );


    console.log(
      'PASS: Updated data persisted'
    );


    /*
     * ========================================================
     * 6. FIND UPDATED USER AGAIN
     * ========================================================
     */

    console.log(
      '6. FIND UPDATED USER'
    );


    const findUpdatedResult =
      UsersService.findUser({

        pilgrimNumber:
          testUser.pilgrimNumber

      });


    assertTrue(
      findUpdatedResult.found
    );


    assertEqual(
      findUpdatedResult.user.UserId,
      userId
    );


    assertEqual(
      findUpdatedResult.user.FullName,
      updatedName
    );


    assertEqual(
      findUpdatedResult.user.GroupId,
      updatedGroup
    );


    console.log(
      'PASS: Updated user found by pilgrim number'
    );


    /*
     * ========================================================
     * 7. DUPLICATE USER TEST
     * ========================================================
     */

    console.log(
      '7. DUPLICATE USER VALIDATION'
    );


    assertThrows(
      function() {

        UsersService.createUser(
          testUser
        );

      },
      'USER_ALREADY_EXISTS'
    );


    console.log(
      'PASS: Duplicate user rejected'
    );


    /*
     * ========================================================
     * 8. DELETE USER
     * ========================================================
     */

    console.log(
      '8. DELETE USER'
    );


    const deleteResult =
      UsersService.deleteUser({

        userId:
          userId

      });


    assertTrue(
      deleteResult.deleted,
      'User should be deleted'
    );


    assertEqual(
      deleteResult.row,
      createdRow
    );


    console.log(
      'PASS: User deleted'
    );


    /*
     * ========================================================
     * 9. VERIFY USER DELETED
     * ========================================================
     */

    console.log(
      '9. VERIFY USER DELETED'
    );


    const deletedFindResult =
      UsersService.findUser({

        pilgrimNumber:
          testUser.pilgrimNumber

      });


    assertFalse(
      deletedFindResult.found,
      'Deleted user should not be found'
    );


    console.log(
      'PASS: Deleted user is no longer found'
    );


    /*
     * ========================================================
     * 10. GET DELETED USER
     * ========================================================
     */

    console.log(
      '10. VERIFY GET DELETED USER'
    );


    assertThrows(
      function() {

        UsersService.getUser({

          userId:
            userId

        });

      },
      'USER_NOT_FOUND'
    );


    console.log(
      'PASS: Deleted user cannot be retrieved'
    );


    /*
     * ========================================================
     * SUCCESS
     * ========================================================
     */

    const duration =
      new Date().getTime() -
      startedAt.getTime();


    console.log('====================================');
    console.log('USERS API TEST PASSED');
    console.log('====================================');

    console.log(
      'UserId: ' +
      userId
    );


    console.log(
      'PilgrimNumber: ' +
      testUser.pilgrimNumber
    );


    console.log(
      'Duration: ' +
      duration +
      'ms'
    );


    return {
      success: true,

      userId:
        userId,

      pilgrimNumber:
        testUser.pilgrimNumber,

      duration:
        duration
    };


  } catch (error) {

    /*
     * ========================================================
     * CLEANUP
     * ========================================================
     *
     * If something fails in the middle,
     * try to remove the test user.
     */

    console.error(
      'USERS API TEST FAILED'
    );


    console.error(
      error.message ||
      String(error)
    );


    if (userId) {

      try {

        const existing =
          UsersRepository.findByUserId(
            userId
          );


        if (existing) {

          UsersRepository.delete(
            existing.row
          );


          console.log(
            'Test user cleanup completed'
          );
        }

      } catch (cleanupError) {

        console.error(
          'Cleanup failed: ' +
          cleanupError.message
        );
      }
    }


    throw error;
  }
}
import test from 'node:test';
import assert from 'node:assert/strict';
import { HallController } from '../controllers/hall.controller';
import { HallService } from '../services/hall.service';

test('=== Hall Manager Management Admin Unit Tests ===', async (t) => {
  const service = new HallService();
  const controller = new HallController();

  await t.test('1. HallService.assignManager validates required fields and password length', async () => {
    // Missing fields
    await assert.rejects(
      async () => {
        await service.assignManager('fake-hall-id', {
          name: '',
          loginId: '',
          password: ''
        });
      },
      { message: 'MISSING_REQUIRED_FIELDS' }
    );

    // Password too short
    await assert.rejects(
      async () => {
        await service.assignManager('fake-hall-id', {
          name: 'Test Manager',
          loginId: 'mgr_test',
          password: '123'
        });
      },
      { message: 'PASSWORD_TOO_SHORT' }
    );

    // Login ID too short
    await assert.rejects(
      async () => {
        await service.assignManager('fake-hall-id', {
          name: 'Test Manager',
          loginId: 'ab',
          password: 'validpassword123'
        });
      },
      { message: 'INVALID_LOGIN_ID_LENGTH' }
    );
  });

  await t.test('2. HallController.assignManager validates payload properly', async () => {
    const req: any = {
      params: { id: 'test-hall-id' },
      body: {}
    };
    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonBody = data;
        return this;
      }
    };

    await controller.assignManager(req, res);
    assert.equal(statusCode, 400);
    assert.match(jsonBody.message, /Please provide either an existing userId or new manager credentials/i);
  });

  await t.test('3. HallController.resetManagerPassword validates newPassword', async () => {
    const req: any = {
      params: { id: 'test-hall-id' },
      body: { newPassword: '123' }
    };
    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonBody = data;
        return this;
      }
    };

    await controller.resetManagerPassword(req, res);
    assert.equal(statusCode, 400);
    assert.match(jsonBody.message, /at least 6 characters/i);
  });

  await t.test('4. HallController.toggleManagerActive validates isActive boolean', async () => {
    const req: any = {
      params: { id: 'test-hall-id' },
      body: { isActive: 'not-a-boolean' }
    };
    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonBody = data;
        return this;
      }
    };

    await controller.toggleManagerActive(req, res);
    assert.equal(statusCode, 400);
    assert.match(jsonBody.message, /isActive boolean flag is required/i);
  });
});

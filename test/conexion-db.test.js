import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db.js';

test('la base SQLite contiene la tabla ordenes y se puede consultar', () => {
    const tabla = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'ordenes'").get();
    const { total } = db.prepare('SELECT COUNT(*) AS total FROM ordenes').get();

    assert.equal(tabla.name, 'ordenes');
    assert.equal(typeof total, 'number');
    assert.ok(total > 0);
});

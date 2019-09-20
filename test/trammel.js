'use strict';

const path = require('path');
const fs = require('fs');

const test = require('supertape');
const tryToCatch = require('try-to-catch');
const tryCatch = require('try-catch');
const {promisify} = require('util');
const trammel = require('..');
const trammel_ = promisify(trammel);

const fixturePath = path.join(__dirname, 'fixture');

test('trammel: size of a file', async (t) => {
    const expected = '12b';
    const [, size] = await tryToCatch(trammel_, `${fixturePath}/file.txt`);
    
    t.equal(expected, size, 'should equal');
    t.end();
});

test('trammel: size of a directory', async (t) => {
    const expected = '12b';
    const [, size] = await tryToCatch(trammel_, `${fixturePath}/dir`);
    
    t.equal(expected, size, 'should equal');
    t.end();
});

test('trammel: size of a directory: empty dir: raw', async (t) => {
    const expected = 0;
    const [, size] = await tryToCatch(trammel_, `${fixturePath}/empty-dir`, {
        type: 'raw',
    });
    
    t.equal(expected, size, 'should equal');
    t.end();
});

test('trammel: stopOnError: false', async (t) => {
    const expected = '0b';
    const [, size] = await tryToCatch(trammel_, 'abcef');
    
    t.equal(size, expected, 'should equal');
    t.end();
});

test('trammel: error', async (t) => {
    const [, size] = await tryToCatch(trammel_, 'abcd');
    
    t.equal(size, '0b', 'should equal');
    t.end();
});

test('trammel: stopOnError: true', async (t) => {
    const [e] = await tryToCatch(trammel_, 'abcd', {stopOnError: true});
    
    t.equal(e.code, 'ENOENT', 'should equal');
    t.end();
});

test('trammel: stopOnError: true: can not readdir', async (t) => {
    const error = Error('hello');
    const {readdir} = fs;
    
    fs.readdir = (dir, fn) => fn(error);
    
    const [e] = await tryToCatch(trammel_, fixturePath, {
        stopOnError: true,
    });
    
    fs.readdir = readdir;
    
    t.equal(e.message, 'hello', 'should equal');
    t.end();
});

test('trammel: can not readdir', async (t) => {
    const expected = '0b';
    const {readdir} = fs;
    
    fs.readdir = (dir, fn) => fn(Error('hi'));
    
    const [, size] = await tryToCatch(trammel_, fixturePath);
    
    fs.readdir = readdir;
    
    t.equal(size, expected, 'should equal');
    t.end();
});

test('trammel: arguments: no', async (t) => {
    const [e] = tryCatch(trammel);
    
    t.equal(e.message, 'dir could not be empty!', 'should equal');
    t.end();
});

test('trammel: arguments: no callback', async (t) => {
    const [e] = tryCatch(trammel, '/');
    
    t.equal(e.message, 'callback could not be empty!', 'should equal');
    t.end();
});


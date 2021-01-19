'use strict';

const path = require('path');
const fs = require('fs');

const test = require('supertape');
const tryToCatch = require('try-to-catch');
const {reRequire} = require('mock-require');

const trammel = require('..');

const fixturePath = path.join(__dirname, 'fixture');

test('trammel: size of a file', async (t) => {
    const expected = '12b';
    const [, size] = await tryToCatch(trammel, `${fixturePath}/file.txt`);
    
    t.equal(size, expected, 'should equal');
    t.end();
});

test('trammel: size of a directory', async (t) => {
    const expected = '12b';
    const [, size] = await tryToCatch(trammel, `${fixturePath}/dir`);
    
    t.equal(size, expected, 'should equal');
    t.end();
});

test('trammel: size of a directory: empty dir: raw', async (t) => {
    const expected = 0;
    const [, size] = await tryToCatch(trammel, `${fixturePath}/empty-dir`, {
        type: 'raw',
    });
    
    t.equal(size, expected, 'should equal');
    t.end();
});

test('trammel: stopOnError: false', async (t) => {
    const expected = '0b';
    const [, size] = await tryToCatch(trammel, 'abcef');
    
    t.equal(size, expected, 'should equal');
    t.end();
});

test('trammel: error', async (t) => {
    const [, size] = await tryToCatch(trammel, 'abcd');
    
    t.equal(size, '0b', 'should equal');
    t.end();
});

test('trammel: stopOnError: true', async (t) => {
    const [e] = await tryToCatch(trammel, 'abcd', {stopOnError: true});
    
    t.equal(e.code, 'ENOENT', 'should equal');
    t.end();
});

test('trammel: stopOnError: true: can not readdir', async (t) => {
    const error = Error('hello');
    const {readdir} = fs.promises;
    
    fs.promises.readdir = async () => {
        throw error;
    };
    
    const trammel = reRequire('..');
    
    const [e] = await tryToCatch(trammel, fixturePath, {
        stopOnError: true,
    });
    
    fs.promises.readdir = readdir;
    
    t.equal(e.message, 'hello', 'should equal');
    t.end();
});

test('trammel: readdir: empty', async (t) => {
    const {readdir} = fs.promises;
    
    fs.promises.readdir = async () => [];
    
    const trammel = reRequire('..');
    
    const size = await trammel(fixturePath, {
        type: 'raw',
    });
    
    fs.promises.readdir = readdir;
    
    t.equal(size, 0, 'should equal');
    t.end();
});

test('trammel: can not readdir', async (t) => {
    const expected = '0b';
    const {readdir} = fs.promises;
    
    fs.promises.readdir = () => {
        throw Error('hi');
    };
    
    const trammel = reRequire('..');
    
    const [, size] = await tryToCatch(trammel, fixturePath);
    
    fs.promises.readdir = readdir;
    
    t.equal(size, expected, 'should equal');
    t.end();
});


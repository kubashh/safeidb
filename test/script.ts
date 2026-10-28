import { safeidb } from "../src/safeidb";

//
// consts
//

const obj = {
  text: `It works!`,
  nested: {
    in: {
      type: `type`,
      me: {
        num: 20,
      },
    },
  },
};

//
// run
//

try {
  await test1();
  await test2();
} catch (err) {
  error(err as string);
}

//
// tests
//

async function test1() {
  clear();

  // setting items
  await Promise.all([
    safeidb.setItem(`key1`, obj),
    safeidb.setItem(`key2`, 3.14),
  ]);

  expect(
    `Setting 1`,
    JSON.stringify(await safeidb.getItem<any>(`key1`)) === JSON.stringify(obj),
  );
  expect(`Setting 2`, (await safeidb.getItem(`key2`)) === 3.14);

  // length
  expect(`Length`, (await safeidb.length()) === 2);

  // keys
  expect(
    `Keys`,
    (await safeidb.keys()).reduce(
      (prev, val) => [`key1`, `key2`].includes(val as string) && prev,
      true,
    ),
  );

  // clear
  await safeidb.clear();

  expect(`Clear empty 1`, (await safeidb.getItem(`key1`)) === null);
  expect(`Clear empty 2`, (await safeidb.getItem(`key2`)) === null);
}

async function test2() {
  await safeidb.clear();

  await Promise.all([
    safeidb.setItem(`key1`, [obj]),
    safeidb.setItem(`key2`, [[obj]]),
    safeidb.setItem(`key3`, [[[obj]]]),
    safeidb.setItem(`key4`, { ...obj }),
    safeidb.setItem(`kfds`, [{ ...obj }]),
    safeidb.setItem(`kefsgas`, [{ ...obj }]),
    safeidb.setItem(`keygsagsd`, [{ ...obj }]),
    safeidb.setItem(`keFsdfsd`, [{ ...obj }]),
    safeidb.setItem(`keyfd`, [{ ...obj, ff: 343 }]),
    safeidb.setItem(`keygasdg`, [{ s: { ...obj } }, `lllf`]),
    safeidb.setItem(`kefasdds`, [obj, `fsd`, true, false]),
    safeidb.setItem(`keyfagdfsda1`, [obj, false, 0, 0.1, -34, -0.434]),
    safeidb.setItem(`keygsadgsd`, [obj, [null, [undefined]]]),
    safeidb.setItem(`keygsdgads`, [obj]),
  ]);

  log((await safeidb.keys()).join(` `));
  log(
    (await getAllEntries()).reduce(
      (prev: string, val: any) => prev + ` ` + JSON.stringify(val),
      ``,
    ),
  );
}

//
// utils
//

async function getAllValues(): Promise<any> {
  const arr = [];
  const keys = await safeidb.keys();
  for (const key of keys) {
    arr.push(await safeidb.getItem(key));
  }
  return arr;
}

async function getAllEntries(): Promise<any> {
  const arr = [];
  const keys = await safeidb.keys();
  for (const key of keys) {
    arr.push([key, await safeidb.getItem(key)]);
  }
  return arr;
}

function expect(label: string, condition: boolean) {
  if (!condition) {
    safeidb.clear();
    error(`${label} not passed!`);
  } else log(`${label} passed`);
}

function log(msg: string) {
  const element = document.createElement(`div`);
  element.className = `log`;
  element.innerText = msg;
  document.body.appendChild(element);
}

function error(msg: string) {
  const element = document.createElement(`div`);
  element.className = `err`;
  element.innerText = msg;
  document.body.appendChild(element);
}

function clear() {
  document.body.innerHTML = ``;
}

import { safeidb } from "../src/safeidb";

async function main() {
  // empty
  expect(`Empty 1`, (await safeidb.getItem(`key1`)) === null);
  expect(`Empty 2`, (await safeidb.getItem(`key2`)) === null);

  // setting items
  const obj = { text: `It works!` };
  await safeidb.setItem(`key1`, obj);
  await safeidb.setItem(`key2`, 3.14);

  expect(`Setting 1`, (await safeidb.getItem<any>(`key1`))?.text === obj.text);
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

  expect(`Clear 1`, (await safeidb.getItem(`key1`)) === null);
  expect(`Clear 2`, (await safeidb.getItem(`key2`)) === null);
}

function expect(label: string, condition: boolean) {
  if (!condition) {
    safeidb.clear();
    throw new Error(`Not passed ${label}!`);
  } else console.log(`Passed ${label}`);
}

main();

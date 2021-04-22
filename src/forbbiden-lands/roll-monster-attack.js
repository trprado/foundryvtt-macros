/**
 * Call Forbidden Lands roll attack with attack params.
 * @param {Object} attack - An object contains selected actor's attack.
 */
async function monsterRoll(attack) {
  const weapon = actor.getOwnedItem(attack._id)
  // Call for Forbidden Lands attack roll dialog.
  await CONFIG.rollDialog.prepareRollDialog(
    attack.name,
    weapon.data.data.dice,
    0,
    0,
    "",
    0,
    weapon.data.data.damage,
    CONFIG.diceRoller,
    null
  );
}

/**
 * Gets a random attack based on attacks that exist in the actor's sheet.
 * @param {Object} token - An object with a foundry token data.
 * @returns {Object} - A selected attack.
 */
function getAttack(token) {
  const actor = game.actors.get(token.data.actorId);
  const items = actor._data.items;
  let attacks = []

  items.forEach((elem) => {
    if (elem.type === "monsterAttack")
      attacks.push(elem);
  });
  // select attack based on a number of attacks that exist in actor.
  let roll = new Roll(`1d${attacks.length}`).roll();
  console.log(roll.result);
  console.log(attacks[roll.result - 1]);
  const attack = attacks[roll.result - 1];

  return attack;
}

/**
 * Main macro function.
 * Based on a selected token, it gets an attack object and shows
 * in the chat a message before it calls the attack dialog.
 */
async function monsterAttack() {
  const token = canvas.tokens.controlled[0];
  if (!token)
    return ui.notifications.error("Need select a token of a monster!")

  if (token.sheet.actor.data.type !== "monster") {
    return ui.notifications.error("Actor is not a Monster.")
  }

  if (!token.inCombat && game.combat) {
    await token.toggleCombat();
  } else if (!game.combat) {
    game.tables.getName("Initiative").reset()
    await token.toggleCombat();
  }

  const attack = getAttack(token);

  // Chat message with selected attack.
  const css = `
      border: 3px solid #bbb;
      box-sizing:content-box;
      position:relative;
      display: block;
      margin-left: auto;
      margin-right: auto;
      top: 3px;
      width: 77px;
    `;
  const message = `<h2>${attack.name}</h2>
    <img src="${attack.img}" style="${css}">
    <h3><b>Type:</b> ${attack.data.damageType}, <b>Range:</b> ${attack.data.range}</h3>
    <p><b>Description:</b> ${attack.data.description}</p>`;

  ChatMessage.create({
    user: token.data._id,
    speaker: ChatMessage.getSpeaker({
      token: actor
    }),
    content: message
  });

  await monsterRoll(attack);
}

monsterAttack();

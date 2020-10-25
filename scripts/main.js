/*
	Copyright (c) DeltaNedas 2020

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const ui = require("ui-lib/library");

var target = null, lastTarget = null;
var display = null;

const updateTarget = enemy => {
	display.clear();
	if (!enemy) return;

	const block = enemy instanceof Building ? enemy.block : null;
	const unit = enemy instanceof Unit ? enemy.type : null;
	const player = unit && enemy.isPlayer() ? enemy.controller : null;
	const icon = block ? block.icon(Cicon.full) : enemy.icon();

	/* The WAISA bit, what is the thing being shot */
	const info = display.table().get();
	info.image(icon).size(48);

	/* Block, Unit, Player names */
	info.add("[#" + enemy.team.color + "]" + (block ? block.localizedName :
		player ? player.name : unit.localizedName)).padLeft(5);
	display.row();

	display.add(new Bar(
		() => "Health: " + enemy.health,
		() => Pal.health,
		() => enemy.healthf())).size(200, 25);
	display.row();

	if (block) {
		if (enemy instanceof Turret.TurretBuild) {
			// Ammo display for blocks
			const max = enemy.block.maxAmmo;
			display.add(new Bar(
				() => "Ammo: " + enemy.totalAmmo,
				() => Pal.ammo,
				() => enemy.totalAmmo / max)).size(200, 25);
			display.row();
		}

		display.add(enemy.tile.x + ", " + enemy.tile.y);
	} else {
		// Ammo display for units
		if (enemy instanceof Weaponsc) {
			display.add(new Bar(
				() => "Ammo: " + enemy.ammo,
				() => Pal.ammo,
				() => enemy.ammof())).size(200, 25);
			display.row();
		}

		if (enemy instanceof Shieldc) {
			display.label(() => "Shield: " + Math.floor(enemy.shield));
			display.row();
			display.add("Armor: " + Math.floor(enemy.armor) + "%");
			display.row();
		}

		display.label(() => Math.round(enemy.x / Vars.tilesize)
			+ ", " + Math.round(enemy.y / Vars.tilesize));
	}
};

ui.addTable("bottom", "!enemy", table => {
	display = table;
	table.left();
	table.defaults().left();
	table.background(Tex.buttonTrans);
	table.visibility = () => !!target && target.health > 0;
	table.touchable = Touchable.disabled
});

Events.on(WorldLoadEvent, () => {
	target = null;
});

const check = () => {
	if (target != lastTarget) {
		updateTarget(target);
	}
	lastTarget = target;
};

// Find targets
Events.run(Trigger.update, () => {
	const p = Vars.player;
	if (!p.shooting) return;

	const found = Units.closestTarget(p.team(),
		p.mouseX, p.mouseY, 16);
	// Keep old info shown until new target shot at
	if (found) {
		target = found;
		check();
	}
});

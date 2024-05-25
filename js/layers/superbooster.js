addLayer("sb", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
        auto() {
            if (!player.sb.auto || !hasMilestone('i', 11)) return false
            else return true
        },
        disabled: false,
        upgDisabled: false,
    }},
    nodeStyle() {
        return options.imageNode ? {
            'color': 'white',
            'background-image': 'url("resources/superbooster.png")',
            'background-position': 'center center',
            'background-size': '108%',
            'border': '1px solid white'
        } : {
            'background-image': 'radial-gradient(circle at center, #a090e0, #504870)'
        }
    },
    name: "Super Boosters",
    symbol: "SB",
    color: "#a090e0",                       // The color for this layer, which affects many elements.
    resource: "Super Boosters",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    position: 2,

    baseResource: "Boosters",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.b.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(46),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 1.2,
    base: 1.1,
    autoPrestige() {
        return (hasMilestone('i', 11) && player.sb.auto)
    },    
    hotkeys: [
        {
            key: "B", // What the hotkey button is. Use uppercase if it's combined with shift, or "ctrl+x" for holding down ctrl.
            description: "shift+B: reset your Boosters for Super-Boosters", // The description of the hotkey that is displayed in the game's How To Play tab
            onPress() { if (player.sb.unlocked) doReset("sb") }, // Determines if you can use the hotkey, optional
        }
    ],                        // "normal" prestige gain is (currency^exponent).

    gainMult() {
        let mult = new Decimal(1)                          // Returns your multiplier to your gain of the prestige resource.
        return mult              // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { return hasUpgrade('h', 22) || player[this.layer].unlocked }, 
    passiveGeneration() {
    },
    resetsNothing() {
        return hasMilestone('i', 9)
    },
    effect() {
        let effect = new Decimal(0.25).times(player.sb.points)
        if (player.br.buff.gte(3)) effect = effect.times(tmp.br.effect3)
        if (player.sb.disabled) effect = new Decimal(0)
        return effect
    },
    effectDescription(){
            return "boosting Boosters' base by +" + format(tmp[this.layer].effect)        
    },
    upgrades:{
        11: {
            title: "Honour Return",
            description: "Boost Honour Effect based on Super Boosters.",
            cost: new Decimal(2),
            effect() {
                let power = player.sb.points.add(1).pow(2.44)
                if (player.sb.upgDisabled) power = new Decimal(1)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
        },
        12: {
            title: "ミキ+: Another Update",
            description: "Unlock Row 3 of Art Upgrades.",
            cost: new Decimal(4),
            unlocked(){ return true},
        },
    },
    doReset(prestige) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[prestige].row <= this.row) return ;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptMilestones = [];
        if (hasMilestone('i', 3)) {
            for (j=0; j<3; j++) {
                if (hasMilestone('h', j)) keptMilestones.push(j)
            }
        }
    
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
        if (hasMilestone('i', 4)) keep.push('upgrades')
    
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].milestones.push(...keptMilestones);
    },
    layerShown() {return hasUpgrade('a', 24) || player[this.layer].unlocked}}
)
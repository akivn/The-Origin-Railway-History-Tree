const func = {
    respec() {
        if(getClickableState('i', 'respecOnNextInfinity') === 'ON') {
            player.i.studyPoints = tmp.i.maxStudyPoints;
            if (hasUpgrade('i', 141)) {player.i.upgrades = [51, 61, 91, 121, 141];player.i.studyPoints = player.i.studyPoints.minus(16)}
            else if (hasUpgrade('i', 121)) {player.i.upgrades = [51, 61, 91, 121];player.i.studyPoints = player.i.studyPoints.minus(16)}
            else if (hasUpgrade('i', 91)) {player.i.upgrades = [51, 61, 91];player.i.studyPoints = player.i.studyPoints.minus(8)}
            else if (hasUpgrade('i', 61)) {player.i.upgrades = [51, 61];player.i.studyPoints = player.i.studyPoints.minus(4)}
            else if (hasUpgrade('i', 51)) {player.i.upgrades = [51];player.i.studyPoints = player.i.studyPoints.minus(2)}
            else player.i.upgrades = []
            player.i.clickables.respecOnNextInfinity = 'OFF'
        }
    }
}
addLayer("i", {
    name: "Infinity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "∞", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: 3, // Row the layer is in on the tree (0 is the first row)
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        fastestCrunch: new Decimal(31415926),
        timeInCurrentInfinity: new Decimal(0),
        infinities: new Decimal(0),
        studyPoints: new Decimal(0),
        challenge1Time: new Decimal(0),
        challenge1Best: new Decimal(1e99),
        challenge2Time: new Decimal(0),
        challenge2Best: new Decimal(1e99),
        challenge3Time: new Decimal(0),
        challenge3Best: new Decimal(1e99),
        challenge4Time: new Decimal(0),
        challenge4Best: new Decimal(1e99),
        ipps: new Decimal(0),
        infpower: new Decimal(0),
        bought1: new Decimal(0),
        bought2: new Decimal(0),
        bought3: new Decimal(0),
        bought4: new Decimal(0),
        bought5: new Decimal(0),
        bought6: new Decimal(0),
        bought7: new Decimal(0),
        bought8: new Decimal(0),
    }},
    nodeStyle() {
        return options.imageNode ? {
            'color': 'white',
            'background-image': 'url("resources/Infinity.webp")',
            'background-position': 'center center',
            'background-size': '100%',
            'border': '1px solid white'
        } : {
            'background-image': 'radial-gradient(circle at center, orange, #e3bb29)'
        }
    },
    color: "orange",
    requires: new Decimal(2).pow(1024), // Can be a function that takes requirement increases into account
    resource: "Infinity Points", // Name of prestige currency
    branches: ['h'],
    baseResource: "Arts", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.003, // Prestige currency exponent
    hotkeys: [ {key: "i", description: "I: Crunch for Infinity points",
    onPress(){
        if (player.crunch.crunched || (hasUpgrade('i', 91) && player.a.points.gte(new Decimal(2).pow(1024)))) clickClickable('i', 'crunch')}
    }],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasMilestone('i', 12)) mult = mult.times(tmp.i.milestones[12].effect);
        mult = mult.times(tmp.i.buyables['ip'].effect)
        if (hasUpgrade('i', 103)) mult = mult.times(upgradeEffect('i', 103))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    maxStudyPoints() {
        return getBuyableAmount('i', 11).plus(getBuyableAmount('i', 12)).plus(getBuyableAmount('i', 13))
    },
    sumOfBestChallenges() {
        return player.i.challenge1Best.plus(player.i.challenge2Best).plus(player.i.challenge3Best).plus(player.i.challenge4Best)
    },
    totalCompletions() {
        let complete = new Decimal(0)
        for (k=1;k<3;k++) {
            for (j=1;j<3;j++) {
                complete = complete.add(challengeCompletions('i', 10*k+j))
            }
        }
        return complete
    },
    infpower: {
        perSecond() {
            let perSecond = buyableEffect('i', 101)
            if (player.i.timeInCurrentInfinity<=0.07) perSecond = new Decimal(0)
            return perSecond
        },
        effect() {
            let effect = player.i.infpower.pow(5).add(1)
            let base = new Decimal(0.4625)
            effect = effect = softcap(effect, new Decimal(1), new Decimal(1).div(effect.log(10).div(308).add(1).pow(base)))  
            return effect
        },
    },
    update(delta) {
        player.i.timeInCurrentInfinity = player.i.timeInCurrentInfinity.add(Decimal.times(new Decimal(1), delta))
        if (player.i.timeInCurrentInfinity.gt(0)) ipps = getResetGain('i', "normal").div(player.i.timeInCurrentInfinity)
        if (player.i.timeInCurrentInfinity == new Decimal(0)) ipps = new Decimal(0)
        if (inChallenge('i', 11)) player.i.challenge1Time = player.i.timeInCurrentInfinity
        if (inChallenge('i', 12)) player.i.challenge2Time = player.i.timeInCurrentInfinity
        if (inChallenge('i', 21)) player.i.challenge3Time = player.i.timeInCurrentInfinity
        if (inChallenge('i', 22)) player.i.challenge4Time = player.i.timeInCurrentInfinity
        player.i.infpower = player.i.infpower.add(Decimal.times(tmp.i.infpower.perSecond, delta))
        player.i.buyables[101] = player.i.buyables[101].add(Decimal.times(tmp.i.buyables[102].effect, delta));
    },
    upgrades: {
        11: {
            title: "Restart",
            description: "You get a boost on Art gain based on your Infinity Upgrade count.",
            cost: new Decimal(1),
            currencyDisplayName: "Study",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let length = new Decimal(0)
                for(i=1;i<5;i++){ //rows
                    for(v=1;v<4;v++){ //columns
                        if (hasUpgrade(this.layer, i+v*10)) length = length.add(1)
                      }
                }
                let power = length.add(1).pow(2.5)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [21, 22]
        },
        21: {
            title: "Doubling Clover",
            description: "'Effect Increaser' is now 1.2x more effective.",
            cost: new Decimal(1),
            currencyDisplayName: "Study",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            canAfford() {return hasUpgrade('i', 11) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost) && !hasUpgrade('i', 22)},
            unlocked(){ return true},
        },
        22: {
            title: "Stronger Dimensions",
            description: "Art Dimension Multiplier is now 2.2x.",
            canAfford() {return hasUpgrade('i', 11) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost) && !hasUpgrade('i', 21)},
            cost: new Decimal(1),
            currencyDisplayName: "Study",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            unlocked(){ return true},
        },
        31: {
            title: "Infinity Stackup",
            description: "Boost Art progress based on your Infinities",
            canAfford() {return (hasUpgrade('i', 21) || hasUpgrade('i', 22)) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = player.i.infinities.times(3).add(1)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [21, 22]
        },
        41: {
            title: "Active I",
            description: "Boost Art gain based on time in this Infinity.",
            canAfford() {return (!hasUpgrade('i', 42) && !hasUpgrade('i', 43)) && hasUpgrade('i', 31) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = new Decimal(59).div(player.i.timeInCurrentInfinity.pow(0.444)).add(1)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [31]
        },
        42: {
            title: "Idle I",
            description: "Boost Art gain based on time in this Infinity.",
            canAfford() {return (!hasUpgrade('i', 41) && !hasUpgrade('i', 43)) && hasUpgrade('i', 31) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = new Decimal(20)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [31]
        },
        43: {
            title: "Passive I",
            description: "Boost Art gain based on time in this Infinity.",
            canAfford() {return (!hasUpgrade('i', 41) && !hasUpgrade('i', 42)) && hasUpgrade('i', 31) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = player.i.timeInCurrentInfinity.pow(0.5).times(3).add(1)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [31]
        },
        51: {
            title: "Multiplying!",
            description: "Unlock 2x IP buyable.",
            canAfford() {return (hasUpgrade('i', 41) || hasUpgrade('i', 42) || hasUpgrade('i', 43)) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            unlocked(){ return true},
            branches: [41,42,43]
        },
        61: {
            title: "Alternate Universes",
            description: "Unlock Challenges.",
            canAfford() {return (hasUpgrade('i', 51)) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            unlocked(){ return true},
            branches: [51]
        },
        71: {
            title: "Cecil's Help",
            description: "Honour Yua Sakurai is uncapped and uses a better formula.",
            canAfford() {return (hasUpgrade('i', 61)) && (hasUpgrade('i', 41) || hasUpgrade('i', 42) || hasUpgrade('i', 43)) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost) && !hasUpgrade('i', 72)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            unlocked(){ return true},
            branches: [61]
        },
        72: {
            title: "Honour Perking",
            description: "Booster cost is divided by Honour.",
            canAfford() {return (hasUpgrade('i', 61)) && (hasUpgrade('i', 41) || hasUpgrade('i', 42) || hasUpgrade('i', 43)) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost) && !hasUpgrade('i', 71)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = player.h.points.add(1).pow(2)
                let base = new Decimal(0.15)
                power = softcap(power, new Decimal(1), new Decimal(1).div(power.add(10).log(10).div(20).add(1).pow(base)))
                return power
            },
            effectDisplay() { return `/${format(upgradeEffect(this.layer, this.id))}` },
            unlocked(){ return true},
            branches: [61]
        },
        81: {
            title: "Open Heart 'Special'!",
            description: "Breakthrough effect is stronger based on your Super boosters.",
            canAfford() {return (hasUpgrade('i', 71)) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = player.sb.points.add(1).pow(0.45)
                power = softcap(power, new Decimal(2), new Decimal(0.08))
                return power
            },
            effectDisplay() { return `^${format(upgradeEffect(this.layer, this.id))}` },
            unlocked(){ return true},
            branches: [71]
        },
        82: {
            title: "1UP",
            description: "Gain more Honour based on your Infinity Points.",
            canAfford() {return (hasUpgrade('i', 72)) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(2),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = player.i.points.add(1).pow(0.8)
                let base = new Decimal(0.08)
                power = softcap(power, new Decimal(1), new Decimal(1).div(power.add(10).log(10).div(35).add(1).pow(base)))
                return power
            },
            effectDisplay() { return `${format(upgradeEffect(this.layer, this.id))}x` },
            unlocked(){ return true},
            branches: [72]
        },
        91: {
            title: "Angry Miki Breaks more barriers!",
            description: "Break Infinity. Requires 4 completed Challenges.",
            canAfford() {return ((hasUpgrade('i', 81) || hasUpgrade('i', 82)) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost) && tmp.i.totalCompletions.gte(4))},
            cost: new Decimal(4),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            unlocked(){ return true},
            onPurchase() {
                return player.crunch.crunched = false
            },
            branches: [81,82]
        },
        101: {
            title: "Normal I",
            description: "Art gain is boosted by the number of Generators you have.",
            canAfford() {return (!hasUpgrade('i', 102) && !hasUpgrade('i', 103)) && (hasUpgrade('i', 81) || hasUpgrade('i', 82)) && hasUpgrade('i', 91) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(4),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = new Decimal(1.4).pow(player.g.points).add(1)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [91]
        },
        102: {
            title: "Honour I",
            description: "Honour gain is boosted by the number of Generators you have.",
            canAfford() {return (!hasUpgrade('i', 101) && !hasUpgrade('i', 103)) && (hasUpgrade('i', 81) || hasUpgrade('i', 82)) && hasUpgrade('i', 91) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(4),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = player.g.points.pow(2).add(1)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [91]
        },
        103: {
            title: "Infinity I",
            description: "Infinity Point gain is boosted by the number of Generators you have.",
            canAfford() {return (!hasUpgrade('i', 101) && !hasUpgrade('i', 102)) && (hasUpgrade('i', 81) || hasUpgrade('i', 82)) && hasUpgrade('i', 91) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(4),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = player.g.points.pow(0.4).add(1)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [91]
        },
        111: {
            title: "Normal II",
            description: "Art Dimensions gain a boost based on your time in this infinity. (Caps at 40x.)",
            canAfford() {return hasUpgrade('i', 101) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(4),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = player.i.timeInCurrentInfinity.pow(0.4).times(4)
                if (power.gte(40)) power = new Decimal(40)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [101]
        },
        112: {
            title: "Honour II",
            description: "Each Breakthrough Point gives a division of 1e5 to Generator cost.",
            canAfford() {return hasUpgrade('i', 102) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(4),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = new Decimal(1e5).pow(player.br.points)
                return power
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) },
            unlocked(){ return true},
            branches: [102]
        },
        113: {
            title: "Infinity II",
            description: "Your sum of the first 4 challenge times boost Booster's Base.",
            canAfford() {return hasUpgrade('i', 103) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(4),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = new Decimal(625).div(tmp.i.sumOfBestChallenges.add(0.5)).pow(0.5).minus(1)
                if (power.lte(0)) power = new Decimal(0)
                return power
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
            unlocked(){ return true},
            branches: [103]
        },
        121: {
            title: "Let's Rocket!",
            description: "Unlock Rocket.",
            canAfford() {return ((hasUpgrade('i', 111) || hasUpgrade('i', 112) || hasUpgrade('i', 113)) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost) && tmp.i.totalCompletions.gte(4))},
            cost: new Decimal(8),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            unlocked(){ return true},
            branches: [111,112,113]
        },
        131: {
            title: "The Rocket Artist",
            description: "Each rocket gives a boost of 1e12x on Art gain.",
            canAfford() {return !hasUpgrade('i', 132) && (hasUpgrade('i', 111) || hasUpgrade('i', 112) || hasUpgrade('i', 113)) && hasUpgrade('i', 121) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(6),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = new Decimal(1e12).pow(player.r.points)
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [121]
        },
        132: {
            title: "The Infinity Artist",
            description: "Every 5 Generators boost Infinity Point gain by 1.08x.",
            canAfford() {return !hasUpgrade('i', 131) && (hasUpgrade('i', 111) || hasUpgrade('i', 112) || hasUpgrade('i', 113)) && hasUpgrade('i', 121) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(6),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = new Decimal(1.08).pow(player.g.points.div(5).floor())
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked(){ return true},
            branches: [121]
        },
        141: {
            fullDisplay() {
                return `<h2>A Brand new Set of Spaces!</h2><br>Unlock Infinity Dimensions.<br>Requires: 2e9 IP`
            },
            canAfford() {return ((hasUpgrade('i', 131) || hasUpgrade('i', 132)) && player.i.points.gte(tmp.i.upgrades[this.id].cost) && tmp.i.totalCompletions.gte(4))},
            cost: new Decimal(2e9),
            currencyDisplayName: "Infinity Points",
            currencyInternalName: "points",
            currencyLayer: "i",
            buy() {
                return
            },
            unlocked(){ return true},
            branches: [131,132]
        },
        151: {
            title: "Stronger Boost",
            description: "Artspace conversion to Art gain boost scales better.",
            canAfford() {return !hasUpgrade('i', 152) && (hasUpgrade('i', 131) || hasUpgrade('i', 132)) && hasUpgrade('i', 141) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(4),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            unlocked(){ return true},
            branches: [141]
        },
        152: {
            title: "The Alpha Chain",
            description: "Art Dimension 1 count Divides Breakthrough requirement.",
            canAfford() {return !hasUpgrade('i', 151) && (hasUpgrade('i', 131) || hasUpgrade('i', 132)) && hasUpgrade('i', 141) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(4),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = getBuyableAmount('a', 101).add(10).log(10).pow(8)
                return power
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) },
            unlocked(){ return true},
            branches: [141]
        },
        161: {
            title: "Rocket Transformation I",
            description: "Rocket Boosts Honour gain.",
            canAfford() {return hasUpgrade('i', 151) && player.i.studyPoints.gte(tmp.i.upgrades[this.id].cost)},
            cost: new Decimal(8),
            currencyDisplayName: "Studies",
            currencyInternalName: "studyPoints",
            currencyLayer: "i",
            effect() {
                let power = new Decimal(10).pow(player.r.points)
                return power
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) },
            unlocked(){ return true},
            branches: [151]
        },
    },
    buyables: {
        11: {
            cost() { return new Decimal(5.6438030941e102).pow(getBuyableAmount(this.layer, this.id).add(0.5)) },
            canAfford() { return player.a.points.gte(this.cost()) },
            display() { return `Get a Study from your Art amount.<br>Next at ${formatWhole(tmp.i.buyables[11].cost)} Arts` },
            buy() { player.i.studyPoints = player.i.studyPoints.plus(1); player.a.points = player.a.points.minus(this.cost()); setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).plus(1)) },
            buyMax() {
                while(this.canAfford()) {
                    this.buy();
                }
            },
            style() { return { height: '60px' } }
        },
        12: {
            cost() { return new Decimal(2).pow(getBuyableAmount(this.layer, this.id)) },
            canAfford() { return player.i.points.gte(this.cost()) },
            display() { return `Get a Study from your Infinity Points.<br>Next at ${formatWhole(tmp.i.buyables[12].cost)} Infinity Points` },
            buy() { player.i.studyPoints = player.i.studyPoints.plus(1); player.i.points = player.i.points.minus(this.cost()); setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).plus(1)) },
            buyMax() {
                while(this.canAfford()) {
                    this.buy();
                }
            },
            style() { return { height: '60px' } }
        },
        13: {
            cost() { return 0 },
            canAfford() { return false },
            display() { return `Get a Study from your Incrementy amount.<br>Locked` },
            buy() {  },
            style() { return { height: '60px' } }
        },
        'ip': {
            cost() { return new Decimal(2).pow(getBuyableAmount(this.layer, this.id)).pow(new Decimal(1.3).add(Decimal.max(getBuyableAmount(this.layer, this.id), 11).minus(11).times(0.04))).times(10).ceil() },
            canAfford() { return player.i.points.gte(this.cost()) },
            display() { return `x2 IP gain<br>Cost: ${formatWhole(tmp.i.buyables['ip'].cost)} Infinity Points<br>Currently: x${format(tmp.i.buyables['ip'].effect)}` },
            buy() { player.i.points = player.i.points.minus(this.cost()); setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).plus(1)) },
            effect() {
                let power = new Decimal(2).pow(getBuyableAmount(this.layer, this.id))
                return power
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {return hasUpgrade('i', 51)}
        },
        101: {
            title: "Infinity Dimension 1",
            cost() { 
                let base = new Decimal(1e4)
                let cost = new Decimal(base).pow(player.i.bought1).times(1e9)
                cost = softcap(cost, new Decimal(2).pow(1024), new Decimal(1).add(cost.add(2).log(2).minus(512).div(512).minus(1)).pow(0.8))
                return cost 
            },
            effect2(){
                let base = new Decimal(2)
                let power = new Decimal(base).pow(player.i.bought1)
                return power
            },
            effect(x){
                let power = tmp[this.layer].buyables[this.id].effect2.times(x)
                return power
            },
            effect(x){
                let power = tmp[this.layer].buyables[this.id].effect2.times(x)
                return power
            },
            display() { let data = tmp[this.layer].buyables[this.id]
                let d1 = "Cost: " + format(data.cost) + " IP"
                return `${d1}\n\
                Amount: ${format(getBuyableAmount(this.layer, this.id), 2)} (${commaFormat(player.i.bought1, 0)})\n\
                ${format(tmp[this.layer].buyables[this.id].effect2, 2)}x`
            },
            canAfford() { return player.i.points.gte(this.cost()) },
            buy() {
                player.i.points = player.i.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.i.bought1 = player.i.bought1.add(1)
            },
            style() {
                return {height: '66px', width: '200px'}
            }, 
        },
        102: {
            title: "Infinity Dimension 2",
            cost() { 
                let base = new Decimal(1e6)
                let cost = new Decimal(base).pow(player.i.bought2).times(1e14)
                cost = softcap(cost, new Decimal(2).pow(1024), new Decimal(1).add(cost.add(2).log(2).minus(512).div(512).minus(1)).pow(0.8))
                return cost 
            },
            effect2(){
                let base = new Decimal(2)
                let power = new Decimal(base).pow(player.i.bought2)
                return power
            },
            effect(x){
                let power = tmp[this.layer].buyables[this.id].effect2.times(x)
                return power
            },
            effect(x){
                let power = tmp[this.layer].buyables[this.id].effect2.times(x)
                return power
            },
            display() { let data = tmp[this.layer].buyables[this.id]
                let d1 = "Cost: " + format(data.cost) + " IP"
                return `${d1}\n\
                Amount: ${format(getBuyableAmount(this.layer, this.id), 2)} (${commaFormat(player.i.bought2, 0)})\n\
                ${format(tmp[this.layer].buyables[this.id].effect2, 2)}x`
            },
            canAfford() { return player.i.points.gte(this.cost()) },
            buy() {
                player.i.points = player.i.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.i.bought2 = player.i.bought2.add(1)
            },
            style() {
                return {height: '66px', width: '200px'}
            }, 
        },
    },
    challenges: {
        11: {
            fullDisplay() {
                let title = `<h2>Artless</h2><br>`
                let description = `Art Upgrades are disabled.<br>`
                let reward = `Reward: Booster receive a +0.3 base.<br>`
                let fastest = ``
                if (hasChallenge('i', 11)) fastest = `Your fastest completion time is ${formatTime(player.i.challenge1Best)}`
                return title + description + reward + fastest
            },
            canComplete() {return player.crunch.crunched},
            onEnter() {
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.crunch.crunched = false
                player.a.upgDisabled = true
            },
            onExit() {
                func.respec()
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.crunch.crunched = false
                player.a.upgDisabled = false
            },
            onComplete() {
                func.respec()
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.a.upgDisabled = false
            },
        },
        12: {
            fullDisplay() {
                let title = `<h2>Generation-less</h2><br>`
                let description = `Generator layer is disabled (except Art Dimension unlock).<br>`
                let goal = `Goal: 1e154 Arts<br>`
                let reward = `Reward: Breakthrough level scaling is slower.<br>`
                let fastest = ``
                if (hasChallenge('i', 12)) fastest = `Your fastest completion time is ${formatTime(player.i.challenge2Best)}`
                return title + description + goal + reward + fastest
            },
            canComplete() {return player.crunch.crunched},
            onEnter() {
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.crunch.crunched = false
                player.g.disabled = true
                player.g.upgDisabled = true
            },
            onExit() {
                func.respec()
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.crunch.crunched = false
                player.g.disabled = false
                player.g.upgDisabled = false
            },
            onComplete() {
                func.respec()
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.g.disabled = false
                player.g.upgDisabled = false
            },
        },
        21: {
            fullDisplay() {
                let title = `<h2>Boostless 1</h2><br>`
                let description = `Super booster layer is disabled. Booster effect is only ^0.5 as powerful.<br>`
                let goal = `Goal: 1e186 Arts<br>`
                let reward = `Reward: Honour Rem is 1.7x stronger.<br>`
                let fastest = ``
                if (hasChallenge('i', 21)) fastest = `Your fastest completion time is ${formatTime(player.i.challenge3Best)}`
                return title + description + goal + reward + fastest
            },
            canComplete() {return player.crunch.crunched},
            onEnter() {
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.crunch.crunched = false
                player.sb.disabled = true
                player.sb.upgDisabled = true
            },
            onExit() {
                func.respec()
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.crunch.crunched = false
                player.sb.disabled = false
                player.sb.upgDisabled = false
            },
            onComplete() {
                func.respec()
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.sb.disabled = false
                player.sb.upgDisabled = false
            },
        },
        22: {
            fullDisplay() {
                let title = `<h2>Science 1</h2><br>`
                let description = `There is an Increasing amount of Science which divides your Art gain.<br>`
                let goal = `Goal: 1e308 Arts<br>`
                let reward = `Reward: None! xd<br>`
                let fastest = ``
                if (hasChallenge('i', 22)) fastest = `Your fastest completion time is ${formatTime(player.i.challenge4Best)}`
                return title + description + reward + fastest
            },
            canComplete() {return player.crunch.crunched},
            onEnter() {
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.crunch.crunched = false
            },
            onExit() {
                func.respec()
                player.i.timeInCurrentInfinity = new Decimal(0)
                player.crunch.crunched = false
            },
            onComplete() {
                func.respec()
                player.i.timeInCurrentInfinity = new Decimal(0)
            },
        },

    },
    milestones: {
        0: {requirementDescription: "< 30 minutes",
            done() {return player[this.layer].fastestCrunch.lte(1800)}, // Used to determine when to give the milestone
            effectDescription: "Keep all Art Upgrades on Row 4 resets and below.",
        },
        1: {requirementDescription: "< 15 minutes",
            done() {return player[this.layer].fastestCrunch.lte(900)}, // Used to determine when to give the milestone
            effectDescription: "Keep all Booster Milestones on Row 4 resets and below.",
        },
        2: {requirementDescription: "< 11 minutes 11 seconds",
            done() {return player[this.layer].fastestCrunch.lte(671)}, // Used to determine when to give the milestone
            effectDescription: "Keep all Generator Milestones on Row 4 resets and below.",
        },
        3: {requirementDescription: "< 6 minutes",
            done() {return player[this.layer].fastestCrunch.lte(360)}, // Used to determine when to give the milestone
            effectDescription: "Keep the first 3 Honour Milestones on Row 4 resets.",
        },
        4: {requirementDescription: "< 4 minutes",
            done() {return player[this.layer].fastestCrunch.lte(240)}, // Used to determine when to give the milestone
            effectDescription: "Keep your Super Booster Upgrades on Row 4 resets.",
        },
        5: {requirementDescription: "< 3 minutes",
            done() {return player[this.layer].fastestCrunch.lte(180)}, // Used to determine when to give the milestone
            effectDescription: "Keep all Honour Milestones on Row 4 resets.",
        },
        6: {requirementDescription: "< 2 minutes",
            done() {return player[this.layer].fastestCrunch.lte(120)}, // Used to determine when to give the milestone
            effectDescription: "Keep all Honours on Row 4 resets.",
        },
        7: {requirementDescription: "< 1 minute 30 seconds",
            done() {return player[this.layer].fastestCrunch.lte(90)}, // Used to determine when to give the milestone
            effectDescription: "Unlock Breakthrough Buyable Autobuyer.",
            onComplete(){
                player.br.buyableAuto = true
            }
        },
        8: {requirementDescription: "< 1 minute",
            done() {return player[this.layer].fastestCrunch.lte(60)}, // Used to determine when to give the milestone
            effectDescription: "Passively gain 10% of your pending Honour gain per second.",
            onComplete(){
                player.h.passive = true
            }
        },
        9: {requirementDescription: "< 40 seconds",
            done() {return player[this.layer].fastestCrunch.lte(40)}, // Used to determine when to give the milestone
            effectDescription: "Super boosters reset nothing.",
        },
        10: {requirementDescription: "< 30 seconds",
            done() {return player[this.layer].fastestCrunch.lte(30)}, // Used to determine when to give the milestone
            effectDescription: "Keep your Breakthrough Upgrades on Row 4 resets.",
        },
        11: {requirementDescription: "< 20 seconds",
            done() {return player[this.layer].fastestCrunch.lte(20)}, // Used to determine when to give the milestone
            effectDescription: "Automatically gain Super-boosters and Breakthrough points. Breakthrough resets nothing.",
            onComplete(){
                player.sb.auto = true
                player.br.auto = true
            }
        },
        12: {requirementDescription: "< 10 seconds",
            done() {return player[this.layer].fastestCrunch.lte(10)}, // Used to determine when to give the milestone
            effectDescription: "Multiply Infinity Point gain by 2 every crunch.",
            effect() {
                let power = new Decimal(1)
                if (hasMilestone(this.layer, this.id)) power = new Decimal(2)
                return power
            },
        },
    },
    clickables: {
        'crunch': {
            display() { 
                if (!hasUpgrade('i', 91)) return 'Perform a Big Crunch' 
                else return `<h5>+${format(getResetGain('i', "normal"))} IP<br>(${format(ipps)} IP/s)</h5>` 
            },
            canClick() { return player.a.points.gte(new Decimal(2).pow(1024)) },
            onClick() {
                func.respec()
                doReset('i')
                player.i.fastestCrunch = Decimal.min(player.i.fastestCrunch, player.i.timeInCurrentInfinity);
                player.i.timeInCurrentInfinity = new Decimal(0);

                player.i.unlocked = true;
                player.i.infinities = player.i.infinities.add(1);

                player.a.points = new Decimal(0);
                player.a.bestArt = new Decimal(0);

                player.crunch.crunched = false;
                options.forceOneTab = false;
                player.i.clickables.respecOnNextInfinity = 'OFF'
                if (player.i.infinities == new Decimal(1)) showTab('a');
            },
            style() {
                return {
                    width: '250px',
                    height: '100px',
                    border: '8px solid orange !important',
                    'font-size': '24px'
                }
            }
        },
        'buyMax1': {
            display() { 
                return `Buy Max` 
            },
            canClick() { return true },
            onClick() {
                buyMaxBuyable('i', 11)
            },
            style() {
                return {
                    minWidth: '125px',
                    minHeight: '50px',
                }
            }
        },
        'buyMax2': {
            display() { 
                return `Buy Max` 
            },
            canClick() { return true },
            onClick() {
                buyMaxBuyable('i', 12)
            },
            style() {
                return {
                    minWidth: '125px',
                    minHeight: '50px',
                }
            }
        },
        'buyMax3': {
            display() { 
                return `Buy Max` 
            },
            canClick() { return true },
            onClick() {
                buyMaxBuyable('i', 13)
            },
            style() {
                return {
                    minWidth: '125px',
                    minHeight: '50px',
                }
            }
        },
        'respecOnNextInfinity': {
            onClick() { setClickableState(this.layer, this.id, getClickableState(this.layer, this.id) === 'OFF' ? 'ON' : 'OFF') }, 
            canClick() { return true; },
            display() { return `Respec Studies on next Infinity: ${getClickableState(this.layer, this.id)}` },
            style() {
                return {
                    minWidth: '125px',
                    minHeight: '50px',
                }
            }
        }
    },
    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                ["clickable", 'crunch'],
                "blank",
                ['display-text', function() {
                    return `Your Current Crunch time is ${formatTime(player.i.timeInCurrentInfinity)}<br>Your best crunch time is ${formatTime(player.i.fastestCrunch)}` }, { 'font-size': '15px', 'color': 'silver'}
                ],
                ['raw-html', function() {
                    if (player.i.studyPoints.gte(new Decimal(1)) && player.i.studyPoints.lte(new Decimal(1))) return `<div>You have <h2 v-bind>${formatWhole(player.i.studyPoints)}</h2>/${formatWhole(tmp.i.maxStudyPoints)} Study <br><br></div>`
                    return `<div>You have <h2 v-bind>${formatWhole(player.i.studyPoints)}</h2>/${formatWhole(tmp.i.maxStudyPoints)} Studies <br><br></div>`}
                ],
                ["row", [["clickable", 'buyMax1'], ["clickable", 'buyMax2'],, ["clickable", 'buyMax3'],]],
                ["row", [["buyable", 11], ["buyable", 12], ["buyable", 13]]],
                "blank",
                ["buyable", 'ip'],
                "blank",
                ["clickable", 'respecOnNextInfinity'],
                "blank",
                ["upgrade-tree",
                    [[11], [21,22], [31], [41,42,43], [51], [61], [71,72], [81,82], [91], [101,102,103], [111,112,113], [121], [131,132], [141], [151,152],]
                ]
            ],
        },
        "Milestones": {
            content: [
                "main-display",
                ["clickable", 'crunch'],
                "blank",
                "milestones",
            ],
        },
        "Challenges": {
            content: [
                "main-display",
                ["clickable", 'crunch'],
                "blank",
                ['display-text', function() {
                    return `Unless otherwise specified, all Challenge goals are Infinite (1.80e308) Arts.` }, { 'font-size': '15px', 'color': 'silver'}
                ],
                ['display-text', function() {
                    return `You have ${formatWhole(tmp.i.totalCompletions)} Challenge Completions.` }, { 'font-size': '15px', 'color': 'silver'}
                ],
                "blank",
                "challenges",
            ],
            unlocked() {return hasUpgrade('i', 61)}
        },
        "Dimensions": {
            content: [
                "main-display",
                ["clickable", 'crunch'],
                ['raw-html', function() {
                    return `<div><span v-if="player.a.artspace.lt('1e1000')">You have </span><h2 v-bind>${format(player.i.infpower)}</h2> Infinity Power<br><br></div>`}
                ],
                ['display-text', function() {
                    return `Your Infinity Power is boosting Art Dimensions by ${format(tmp.i.infpower.effect)}x`}, { 'font-size': '15px', 'color': 'silver'}],
                ['display-text', function() {
                    return `Infinity Power gain: ${format(tmp.i.infpower.perSecond)} / sec` }, { 'font-size': '15px', 'color': 'silver'}
                ],
                "blank",
                ["buyable", 101],
                ["buyable", 102],
            ],
            unlocked() {return hasUpgrade('i', 141)}
        },
    },
    doReset(prestige) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[prestige].row <= this.row) return;
    
        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 21, Milestones
        let keptUpgrades = [];
    
        // Stage 3, track which main features you want to keep - milestones
        let keep = [];
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
    
        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades);
    },
    layerShown(){return player.i.infinities.gte(0.1)}
})
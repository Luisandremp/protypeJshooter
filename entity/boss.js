module.exports = {
  'team': 0,
  'radius': 50,
  'area': 150,
  'x': 0,
  'y': 0,
  'attackCoolDown': 3000,
  'lastTimeFired': 0,
  'canAttack': function(){
    if (this.lastTimeFired+this.attackCoolDown <= Date.now()) {
      this.lastTimeFired = Date.now();
      return true;
    }
      return false; 
  }
};
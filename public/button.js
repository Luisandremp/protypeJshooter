const button = function(text, x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.clicked = false;
    this.hovered = false;
    this.text = text;
    thisButton = this;

    button.prototype.intersects = function(mouse) {
        const t = 5; //tolerance
        const xIntersect = (mouse.x + t) > this.x && (mouse.x - t) < this.x + this.width  && (mouse.y + t) > this.y && (mouse.y - t) < this.y + this.height;
        return  xIntersect;
    }

    button.prototype.updateState = function(canvas){
        
        if (this.intersects(canvas.mouse)) {
            this.hovered = true;
            if (canvas.mouse.clicked) {
                this.clicked = true;
            }
        } else {
            this.hovered = false;
        }
 
        if (!canvas.mouse.down) {
            this.clicked = false;
        }               
    }

    button.prototype.draw = function(canvas) {
        //set color
        if (this.hovered) {
            canvas.fillStyle = 'green';
        } else {
            canvas.fillStyle = 'gray';
        }
        //draw button
        if (this.clicked) {
            canvas.fillRect(this.x+this.width*0.1, this.y+this.height*0.1, this.width*0.8, this.height*0.8)
        }else{
            canvas.fillRect(this.x, this.y, this.width, this.height);
        }
        
     
        //text options
        const fontSize = 20;
        canvas.fillStyle = 'white';
        canvas.font = fontSize + "px sans-serif";
     
        //text position
        canvas.textBaseline = "top";
        const textSize = canvas.measureText(this.text);
        const textX = this.x + (this.width/2) - (textSize.width / 2);
        const textY = this.y + (this.height/2) - (fontSize/2);
     
        //draw the text
        canvas.fillText(this.text, textX, textY);
    }
}

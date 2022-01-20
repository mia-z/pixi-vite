export const TileGravityAndCollision = (children) => {
    children.forEach(obj => {
        if (obj.dragging) return;

        let colliding = false;

        let bottom = Math.floor((obj.height / 2) + obj.y);
    
        let excludedSelf = children.filter(c => c !== obj);
            
        excludedSelf.forEach(child => {
            if (obj.x < child.x + child.width &&
                obj.x + obj.width > child.x && 
                obj.y < child.y + (child.height-8) &&
                obj.y + obj.height > child.y) {
                    //obj.gravity = 4;
                    colliding = true;
                    if (obj.y + obj.height > child.y) {
                        obj.y = child.y - obj.height + 1;
                    }
                }
        });
        
        if (colliding) return;
    
        let screenBottom = window.innerHeight > 750 ? 750 : window.innerHeight;
        if (bottom < screenBottom) {
            obj.y += 6;
        } else {
            if (bottom > screenBottom) {
                let offset = bottom - screenBottom;
                obj.y -= offset;
            } 
        }
    
        // if (bottom >= window.innerHeight / 2) {
        //     obj.y -= obj.gravity;
        //     obj.gravity = 0.4;
        //     obj.y = (window.innerHeight / 2) - (obj.height / 2);
        // }
    })
}

export default TileGravityAndCollision;
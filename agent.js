FORWARD = 0
BACK = 1
LEFT = 2
RIGHT = 3
UP = 4
DOWN = 5

MOVE = 'move'
TURN = 'turn'
PLACE = 'place'
DESTROY = 'destroy'
SET_COLOR = 'set_color'

LEFT_ROT = math.matrix([[0, 1, 0],
				   [-1, 0, 0],
		           [0, 0, 0]])

RIGHT_ROT = math.matrix([[0, -1, 0],
				    [1, 0, 0],
		            [0, 0, 0]])



function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}


/*
function binarySearch(arr, x, map){

return arr.findIndex(elem => arraysEqual(elem, x))

// var mapped = map(x)

// let recursiveFunction = function (arr, x, func, start, end) {
   
//     // Base Condition 
//     if (start > end) return -1; 
   
//     // Find the middle index 
//     let mid=Math.floor((start + end)/2); 
   
//     // Compare mid with given key x 
//     if (arraysEqual(arr[mid],x)) return mid; 
          
//     // If element at mid is greater than x, 
//     // search in the left half of mid 
//     if(mid < arr.length)
// 	    if(func(arr[mid]) > mapped)  
// 	        return recursiveFunction(arr, x, func, start, mid-1); 
// 	    else
// 	        // If element at mid is smaller than x, 
// 	        // search in the right half of mid 
// 	        return recursiveFunction(arr, x, func, mid+1, end); 
// }



// return recursiveFunction(arr, x, map, 0, arr.length)
}
*/


function howToSort(block1, block2){
	return block1[0] + block1[1] + block1[2] - block2[0] - block2[1] - block2[2]
}


function distance(coord){
	return coord[0] + coord[1] + coord[2]
}

class Environment {

	constructor(){
		this.lastInserted = []
		

		this.conf = {}
		for(let i = -20; i < 20; i++)
			for(let j = -20; j < 20; j++) {
				this.conf[[i, j, 0]] = { 
					top : TOP_DEFAULT,
					side : SIDE_DEFAULT
				}

				this.lastInserted.push([i, j, 0])
			}

			
		Drawing.clean()
	}


	isInConf(coord){
		// return binarySearch(this.conf, coord, distance) > -1
		return this.conf[coord]
	}

	insert(newpos, colors){
		if(!this.isInConf(newpos)){
			this.conf[newpos] = colors
			// this.conf.sort(howToSort)
			this.lastInserted.push(newpos)
		}

		
		// if(this.conf.length == 0){
		// 	this.conf.push(newpos)
		// 	return 0
		// }else{
		// 	let i = 0;
			
		// 	while(distance(newpos) > distance(this.conf[i])){
				
		// 		if(i == this.conf.length - 1)
		// 			break
		// 		i = i + 1
		// 	}
		// 	if(arraysEqual(newpos, this.conf[i]))
		// 		return null
		// 	else{
		// 		this.conf = this.conf.slice(0, i).concat([newpos], this.conf.slice(i, this.conf.length))
		// 		return i
		// 	}

		// }		
		
	}


	getAbsoluteDirection(direction, relative){

		if(relative == LEFT)
			return math.multiply(LEFT_ROT, direction).toArray()

		if(relative == RIGHT)
			return math.multiply(RIGHT_ROT, direction).toArray()

		if(relative == FORWARD)
			return direction

		if(relative == BACK)
			return math.multiply(-1, direction)

		if(relative == UP)
			return [0, 0, 1]
		if(relative == DOWN)
			return [0, 0, -1]

	}


	move(position, direction, relative){
		let absolute = this.getAbsoluteDirection(direction, relative)	
		let newpos = math.add(position, absolute)

		if(!this.isInConf(newpos))
			return newpos
		return position

	}

	turn(direction, relative){
		return this.getAbsoluteDirection(direction, relative)
	}

	place(position, direction, relative, colors){
		let absolute = this.getAbsoluteDirection(direction, relative)
		let newpos = math.add(position, absolute)
		this.insert(newpos, colors)
	}

	destroy(position, direction, relative){
		let absolute = this.getAbsoluteDirection(direction, relative)
		let newpos = math.add(position, absolute)
		delete this.conf[newpos]

		let blockConfig = {
			blockOnTop : {
				shift : [0,0,1]
			},

			blockOnTopLeft : {
				shift : [0,1,1],
			},

			blockOnTopRight : {
				shift : [1,0,1],
			},

			blockOnLeft : {
				shift : [0,1,0],
			},

			blockOnRight : {
				shift : [1,0,0],
			},

			blockInFrontDown : {
				shift : [1,1,0],
			},

			blockInFrontUp : {
				shift : [1,1,1],
			}
		}

		Object.values(blockConfig).forEach(e => {
			let firstPoint = this.firstPointOnDiagonal(math.add(newpos, math.multiply(-1, e.shift)), -1)
			if(firstPoint)
				this.lastInserted.push(firstPoint)
		})
	}

	// direction 1 for forward diagonal, -1 for back diagonal
	firstPointOnDiagonal(start, direction){
		for(let k = 0; k < 20; k++){
			let point = math.add(start, math.multiply(direction, [k,k,k]))
			if(this.isInConf(point))
				return point
		}
		return null
	}


	drawBlock(coords, colors){

		let [x, y, z] = coords

		let top_color = Drawing.scaleColorHeight(colors.top, z)
		let [left_color, right_color] = Drawing.scaleColorSide(colors.side)
		

		let posx = width / 2 + (x - y) * tileWidth / 2;
		let posy = height/2 + 50 + (x + y) * tileHeight / 2;


		let points_top = [[posx, posy - z * tileHeight], 
		  			  [posx + tileWidth/2, posy + tileHeight/2 - z * tileHeight],
		  			  [posx, posy + tileHeight - z * tileHeight],
		  			  [posx - tileWidth/2, posy + tileHeight/2 - z * tileHeight]];

		let points_left = [[posx - tileWidth/2, posy + tileHeight/2 - z * tileHeight],
					   [posx, posy + tileHeight - z * tileHeight],
				  	   [posx, posy + tileHeight - (z-1) * tileHeight],
				  	   [posx - tileWidth/2, posy + tileHeight/2 - (z-1) * tileHeight]];

		let points_right = [[posx + tileWidth/2, posy + tileHeight/2 - z * tileHeight],
					    [posx, posy + tileHeight - z * tileHeight],
				  	    [posx, posy + tileHeight - (z-1) * tileHeight],
				  	    [posx + tileWidth/2, posy + tileHeight/2 - (z-1) * tileHeight]];

		let points_top_left = [points_top[0], points_top[2], points_top[3]]
		let points_top_right = [points_top[0], points_top[1], points_top[2]]

		let points_left_top = [points_left[0], points_left[1], points_left[3]]
		let points_left_down = [points_left[1], points_left[2], points_left[3]]

		let points_right_top = [points_right[0], points_right[1], points_right[3]]
		let points_right_down = [points_right[1], points_right[2], points_right[3]]



		let drawConfig = {
			top_left : {
				draw : true,
				points: points_top_left,
				color : top_color
			},
			top_right : {
				draw : true,
				points: points_top_right,
				color : top_color
			},
			left_top : {
				draw : true,
				points: points_left_top,
				color : left_color
			},
			left_down : {
				draw : true,
				points: points_left_down,
				color : left_color
			},
			right_top : {
				draw : true,
				points: points_right_top,
				color : right_color
			},
			right_down : {
				draw : true,
				points: points_right_down,
				color : right_color
			}
		}

		let blockConfig ={
			blockOnTop : {
				found : false,
				shift : [0,0,1],
				toRemove : ['top_left', 'top_right']
			},

			blockOnTopLeft : {
				found : false,
				shift : [0,1,1],
				toRemove : ['top_left']
			},

			blockOnTopRight : {
				found : false,
				shift : [1,0,1],
				toRemove : ['top_right']
			},

			blockOnLeft : {
				found : false,
				shift : [0,1,0],
				toRemove : ['left_top', 'left_down']
			},

			blockOnRight : {
				found : false,
				shift : [1,0,0],
				toRemove : ['right_top', 'right_down']
			},

			blockInFrontDown : {
				found : false,
				shift : [1,1,0],
				toRemove : ['left_down', 'right_down']
			},

			blockInFrontUp : {
				found : false,
				shift : [1,1,1],
				toRemove : ['top_left', 'top_right', 'left_top', 'left_down', 'right_top', 'right_down']
			}
		}

		Object.values(blockConfig).filter(e =>!e.found).forEach(e => {
			if(this.firstPointOnDiagonal(math.add(e.shift, coords), 1))
				e.found = true
		})

		Object.values(blockConfig).filter(e => e.found).forEach( e => {
			e.toRemove.forEach(pos => {
				drawConfig[pos].draw = false
			})
				
		})

		Object.values(drawConfig).filter(e => e.draw).forEach(e => {
			Drawing.drawPolygon(e.points, e.color)
		})


	}
	drawChanges() {
		this.lastInserted.forEach(e => this.drawBlock(e, this.conf[e]))
		this.lastInserted = []
	}

}



class Agent {
	constructor(env) {
	    this.commands = []
		this.env = env
		this.position = [8, 2, 1]
		this.direction = [0, -1, 0]
		this.colors = { 
			top : TOP_DEFAULT,
			side : SIDE_DEFAULT
		}
	}
	move(direction, steps=1) {
		for(let i = 0; i < steps; i++)
	   		this.commands.push([MOVE, direction])
	}
	turn(direction) {
	    this.commands.push([TURN, direction])
	}
	place(direction) {
	    this.commands.push([PLACE, direction])
	}

	destroy(direction) {
	    this.commands.push([DESTROY, direction])
	}

	set_color(colors) {
	    this.commands.push([SET_COLOR, colors])
	}

	run(command, relative){
		if(command == MOVE)
			this.position = this.env.move(this.position, this.direction, relative)
		if(command == TURN)
			this.direction = this.env.turn(this.direction, relative)
		if(command == PLACE)
			this.env.place(this.position, this.direction, relative, this.colors)
		if(command == DESTROY)
			this.env.destroy(this.position, this.direction, relative)
		if(command == SET_COLOR)
			this.colors = relative
	}

	processNextCommand() {
		let op = this.commands.shift()
		if (op) {
			this.run(op[0], op[1])
		}
		return op;
	}
}

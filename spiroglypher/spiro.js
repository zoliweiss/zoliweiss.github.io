const CONSTS = {
  OUTPUT_IMG_WIDTH: 5001,
  OUTPUT_IMG_HEIGHT: 5001,
  SPIRAL_DENSITY: 0.35,
  MODULATION_FORCE: 25,
  MODULATION_POS_OFFSET: 3,
  MODULATION_NEG_OFFSET: 3,
  SPIRAL_COLOR_R: 127,
  SPIRAL_COLOR_G: 127,
  SPIRAL_COLOR_B: 127,

/* don't change these constans */
  INVALID_COORDINATE: -1
};

Object.freeze(CONSTS);

class Position{
  constructor(){
    this.x = CONSTS.INVALID_COORDINATE;
    this.y = CONSTS.INVALID_COORDINATE;
  }

  init_position(){
    this.x = CONSTS.INVALID_COORDINATE;
    this.y = CONSTS.INVALID_COORDINATE;
  }

  is_position_empty(){
    return CONSTS.INVALID_COORDINATE === this.x && CONSTS.INVALID_COORDINATE === this.y;
  }

  copy(other){
    this.x = other.x;
    this.y = other.y;
  }

  is_valid(){
    return this.x >= 0 && this.x < CONSTS.OUTPUT_IMG_WIDTH && this.y >= 0 && this.y < CONSTS.OUTPUT_IMG_HEIGHT;
  }
}

function put_pixel(x, y, output_map){
  output_map[4 * y * CONSTS.OUTPUT_IMG_WIDTH + 4 * x    ] = CONSTS.SPIRAL_COLOR_R;
  output_map[4 * y * CONSTS.OUTPUT_IMG_WIDTH + 4 * x + 1] = CONSTS.SPIRAL_COLOR_G;
  output_map[4 * y * CONSTS.OUTPUT_IMG_WIDTH + 4 * x + 2] = CONSTS.SPIRAL_COLOR_B;
  output_map[4 * y * CONSTS.OUTPUT_IMG_WIDTH + 4 * x + 3] = 255;
}

function draw_line_x(a, b, output_map){
  var x = 0;
  var l_slope = 1;

  if(a.x < b.x){
    l_slope = (b.y - a.y) / (b.x - a.x);

    for(x = a.x; x <= b.x; x++){
      put_pixel(x, parseInt(a.y + (x - a.x) * l_slope), output_map);
    }
  }
  else{
    l_slope = (a.y - b.y) / (a.x - b.x);

    for(x = b.x; x <= a.x; x++){
      put_pixel(x, parseInt(b.y + (x - b.x) * l_slope), output_map);
    }
  }
}

function draw_line_y(a, b, output_map){
  var y = 0;
  var l_slope = 1;

  if(a.y < b.y){
    l_slope = (b.y - a.y) / (b.x - a.x);

    for(y = a.y; y <= b.y; y++){
      put_pixel(a.x + parseInt((y - a.y) / l_slope), y, output_map);
    }
  }
  else{
    l_slope = (a.y - b.y) / (a.x - b.x);

    for(y = b.y; y <= a.y; y++){
      put_pixel(b.x + parseInt((y - b.y) / l_slope), y, output_map);
    }
  }
}

function draw_line(a, b, output_map){
  var x = 0;
  var y = 0;

  if(!a.is_valid() || !b.is_valid()){
    return;
  }

  if(a.x === b.x){
    for(y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++){
      put_pixel(a.x, y, output_map);
    }
  }
  else if(a.y === b.y){
    for(x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++){
      put_pixel(x, a.y, output_map);
    }
  }
  else if(Math.abs(a.x - b.x) > Math.abs(a.y - b.y)){
    draw_line_x(a, b, output_map);
  }
  else{
    draw_line_y(a, b, output_map);
  }
}

function create_spiral_pair(modulation_map, angle, output_map, outer_spiral_start){
  var l_rotation = 0;
  var l_angle = 0;
  var l_radius = 0;
  var l_inner_radius = 0;
  var l_outer_radius = 0;
  var l_modulation = 0;
  var l_angle_step = 0;
  var l_inverted_lightness = 0;
  var l_pixel = new Position();
  var l_inner_pixel = new Position();
  var l_outer_pixel = new Position();
  var l_old_inner_pixel = new Position();
  var l_old_outer_pixel = new Position();

  for(l_rotation = 0; 360 * CONSTS.SPIRAL_DENSITY * l_rotation + 360 * CONSTS.SPIRAL_DENSITY < Math.min(CONSTS.OUTPUT_IMG_WIDTH / 2 - 10, CONSTS.OUTPUT_IMG_HEIGHT / 2 - 10); l_rotation++){
    l_angle_step = 360 * Math.atan(1 / (360 * CONSTS.SPIRAL_DENSITY * (l_rotation + 1))) / (2 * Math.PI);

    for(l_angle = 0; l_angle < 360; l_angle += l_angle_step){
      l_radius = 360 * CONSTS.SPIRAL_DENSITY * l_rotation + l_angle * CONSTS.SPIRAL_DENSITY;

      l_pixel.x = parseInt(l_radius * Math.sin(2 * Math.PI * (l_angle + angle) / 360) + CONSTS.OUTPUT_IMG_WIDTH / 2 + 1);
      l_pixel.y = parseInt(l_radius * Math.cos(2 * Math.PI * (l_angle + angle) / 360) + CONSTS.OUTPUT_IMG_HEIGHT / 2 + 1);

      if(0 === modulation_map[4 * l_pixel.y * CONSTS.OUTPUT_IMG_WIDTH + 4 * l_pixel.x + 3]){
        l_inverted_lightness = 0;
      }
      else{
        l_inverted_lightness = 255 - parseInt(0.2126 * modulation_map[4 * l_pixel.y * CONSTS.OUTPUT_IMG_WIDTH + 4 * l_pixel.x    ] +
                                              0.7152 * modulation_map[4 * l_pixel.y * CONSTS.OUTPUT_IMG_WIDTH + 4 * l_pixel.x + 1] +
                                              0.0722 * modulation_map[4 * l_pixel.y * CONSTS.OUTPUT_IMG_WIDTH + 4 * l_pixel.x + 2]);
      }

      l_modulation = CONSTS.MODULATION_FORCE * l_inverted_lightness / 255;
      l_outer_radius = l_radius + l_modulation + CONSTS.MODULATION_POS_OFFSET;
      l_inner_radius = Math.max(0, l_radius - l_modulation - CONSTS.MODULATION_NEG_OFFSET);

      l_outer_pixel.x = parseInt(l_outer_radius * Math.sin(2 * Math.PI * (l_angle + angle) / 360) + CONSTS.OUTPUT_IMG_WIDTH / 2 + 1);
      l_outer_pixel.y = parseInt(l_outer_radius * Math.cos(2 * Math.PI * (l_angle + angle) / 360) + CONSTS.OUTPUT_IMG_HEIGHT / 2 + 1);

      l_inner_pixel.x = parseInt(l_inner_radius * Math.sin(2 * Math.PI * (l_angle + angle) / 360) + CONSTS.OUTPUT_IMG_WIDTH / 2 + 1);
      l_inner_pixel.y = parseInt(l_inner_radius * Math.cos(2 * Math.PI * (l_angle + angle) / 360) + CONSTS.OUTPUT_IMG_HEIGHT / 2 + 1);

      if(0 === l_rotation &&
         0 === l_angle){
        if(outer_spiral_start.is_position_empty()){
          outer_spiral_start.copy(l_outer_pixel);
        }

        l_old_outer_pixel.copy(outer_spiral_start);
      }

      draw_line(l_inner_pixel, l_old_inner_pixel, output_map);
      draw_line(l_outer_pixel, l_old_outer_pixel, output_map);

      l_old_inner_pixel.copy(l_inner_pixel);
      l_old_outer_pixel.copy(l_outer_pixel);
    }
  }

  draw_line(l_outer_pixel, l_inner_pixel, output_map);

  return outer_spiral_start;
}

function progress(status){
  console.log(status);
  document.getElementById('image_upload').classList.add('hidden');

  if(status < 0){
    document.getElementById('progress').innerText = ':(';
    document.body.style.backgroundColor = '#b93636';
  }
  else if(status < 100){
    document.getElementById('progress').innerText = status + Math.floor(Math.random() * 5) + '%';
  }
  else{
    document.getElementById('progress').innerText = '✓';
    document.body.style.backgroundColor = '#36b93f';
  }

  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 50);
  });
}

async function process_img(ctx, input_img, file, url){
  if(0 === input_img.width || 0 === input_img.height){
    console.warn('Invalid picture dimensions');
    progress(-1);
    return;
  }

  var l_input_img_width = 0;
  var l_input_img_height = 0;
  var l_start_x = 0;
  var l_start_y = 0;

  if(input_img.width < input_img.height){
    l_input_img_width = parseInt(CONSTS.OUTPUT_IMG_WIDTH * input_img.width / input_img.height);
    l_input_img_height = CONSTS.OUTPUT_IMG_HEIGHT;

    l_start_x = parseInt((CONSTS.OUTPUT_IMG_WIDTH - l_input_img_width) / 2);
    l_start_y = 0;
  }
  else{
    l_input_img_width = CONSTS.OUTPUT_IMG_WIDTH;
    l_input_img_height = parseInt(CONSTS.OUTPUT_IMG_HEIGHT * input_img.height / input_img.width);

    l_start_x = 0;
    l_start_y = parseInt((CONSTS.OUTPUT_IMG_HEIGHT - l_input_img_height) / 2);
  }

  ctx.canvas.width = CONSTS.OUTPUT_IMG_WIDTH;
  ctx.canvas.height = CONSTS.OUTPUT_IMG_HEIGHT;

  await progress(10);

  ctx.filter = 'drop-shadow(0 0 5px white) blur(3px)';

  await progress(50);

  ctx.drawImage(input_img, l_start_x, l_start_y, l_input_img_width, l_input_img_height);
  var l_image_data = ctx.getImageData(0, 0, CONSTS.OUTPUT_IMG_WIDTH, CONSTS.OUTPUT_IMG_HEIGHT);

  var l_outer_spiral_start = new Position();
  var l_output = ctx.createImageData(CONSTS.OUTPUT_IMG_WIDTH, CONSTS.OUTPUT_IMG_HEIGHT);

  await progress(70);

  l_outer_spiral_start = create_spiral_pair(l_image_data.data, 0, l_output.data, l_outer_spiral_start);
  l_outer_spiral_start = create_spiral_pair(l_image_data.data, 180, l_output.data, l_outer_spiral_start);

  await progress(90);

  ctx.putImageData(l_output, 0, 0);
  url.revokeObjectURL(input_img.src);

  await progress(100);
  console.timeEnd();

  var l_link = document.createElement('a');
  l_link.download = file.name.split('.').slice(0, -1).join('.') + '_spiro.png';
  l_link.href = document.getElementById('canvas').toDataURL();
  l_link.click();
}

function main(){
  console.log('Start');
  console.time();

  var l_ctx = document.getElementById('canvas').getContext('2d');
  var l_file = document.getElementById('uploadimage').files[0];
  var l_url = window.URL || window.webkitURL;

  var l_input_img = new Image();
  l_input_img.src = l_url.createObjectURL(l_file);

  l_input_img.onload = function(){
    process_img(l_ctx, l_input_img, l_file, l_url);
  };

  l_input_img.onerror = function(){
    console.warn('Error on picture load');
    progress(-1);
  };
}

document.addEventListener('DOMContentLoaded', function(){
  document.getElementById('uploadimage').addEventListener('change', main, false);
});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('service_worker.js')
  .then(function(registration){
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function(error){
    console.log('Service worker registration failed, error:', error);
  });
}

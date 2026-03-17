const stages=[
    {
      maxSteps:6,
      map:[
        ['P',-5,0,0],
        [0,2,3,0],
        [0,0,0,0],
        [0,0,0,'G']
      ]
    },
    {
      maxSteps:14,
      map:[
        ['P',3,-8,0],
        [0,-2,0,0],
        [5,2,-2,0],
        [0,2,0,'G']
      ]
    },
    {
      maxSteps:14,
      map:[
        [5,0,-10,0], 
        [0,'P',0,3],
        [-5,0,0,2],
        [0,3,2,'G']
      ]
    }
];

let idx=0,map=[],pos={x:0,y:0},pwr=0,step=0,his=[];

function init(){
    console.log(`--- init stage: ${idx+1} ---`);
    const s=stages[idx];
    map=JSON.parse(JSON.stringify(s.map));
    pwr=0;step=s.maxSteps;
    his=[];
    for(let y=0;y<map.length;y++){
        for(let x=0;x<map[y].length;x++){
            if(map[y][x]==='P'){
              pos={x,y};map[y][x]=0
            }
        }
    }
    upd();
}

function upd(){
    console.log(`upd -> pwr: ${pwr}, step: ${step}, pos: (${pos.x},${pos.y})`);
    document.getElementById('power-val').innerText=pwr;
    document.getElementById('step-val').innerText=step;
    document.getElementById('stage-num').innerText=idx+1;
    const sb=document.getElementById('step-container');
    sb.className=step<=3?'limit-alert':'';
    const c=document.getElementById('game-container');
    c.innerHTML='';
    map.forEach((row,y)=>{
        const rD=document.createElement('div');
        rD.className='row';
        row.forEach((cell,x)=>{
            const d=document.createElement('div');
            d.className='cell';
            if(x===pos.x&&y===pos.y){
              d.classList.add('player')
            }
            else if(cell==='G'){
              d.classList.add('goal')
            }
            else if(typeof cell==='number'&&cell!==0){
                const isM=cell>0;
                d.classList.add(isM?'minus':'plus');
                d.innerText=(isM?'-':'+')+Math.abs(cell);
            }else{
              d.classList.add('empty')
            }
            rD.appendChild(d);
        });
        c.appendChild(rD);
    });
}

function mv(dx,dy){
    if(step<=0){console.log("mv failed: no steps");return;}
    const nx=pos.x+dx,ny=pos.y+dy;
    if(ny<0||ny>=map.length||nx<0||nx>=map[0].length){
      console.log("mv failed: out of bounds");
      return;
    }
    const t=map[ny][nx];
    console.log(`mv to: (${nx},${ny}), target: ${t}`);
    if(t==='G'){
        const rem=map.flat().filter(v=>typeof v==='number'&&v!==0).length;
        if(rem===0&&pwr===0){
            console.log("goal success");
            alert("CLEAR!");
            idx++;
            if(idx<stages.length){init()}else{alert("FINISH!");idx=0;
            init()}
        }else{
          console.log(`goal failed: pwr ${pwr}, rem ${rem}`);
          alert(`Pw:${pwr} Rem:${rem}`)
        }
        return;
    }
    if(typeof t==='number'){
        if(t>0&&pwr<t){
          console.log("mv failed: insufficient power");
          return;
        }
        his.push({map:JSON.parse(JSON.stringify(map)),pos:{...pos},pwr,step});
        pwr-=t;step-=1;map[ny][nx]=0;pos={x:nx,y:ny};
        upd();
        if(step===0){
            setTimeout(()=>{
                const r=map.flat().filter(v=>typeof v==='number'&&v!==0).length;
                if(r>0||pwr!==0){console.log("game over: steps 0");alert("GAME OVER");}
            },100);
        }
    }
}

function undo(){
    if(his.length>0){
        console.log("undo executed");
        const l=his.pop();
        map=l.map;pos=l.pos;pwr=l.pwr;step=l.step;
        upd();
    }else{
        console.log("undo failed: no history");
    }
}

window.addEventListener('keydown',e=>{
    const k=e.key;
    if(k==='ArrowUp')mv(0,-1);
    if(k==='ArrowDown')mv(0,1);
    if(k==='ArrowLeft')mv(-1,0);
    if(k==='ArrowRight')mv(1,0);
    if(k==='r'||k==='R')init();
    if(k==='z'||k==='Z')undo();
});

document.getElementById('reset-btn').onclick=init;
document.getElementById('undo-btn').onclick=undo;

init();

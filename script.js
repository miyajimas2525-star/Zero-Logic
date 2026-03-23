//ステージデータ：最大歩数(maxSteps)とマップ構成(map)を定義
//P:スタート位置,G:ゴール,正の数:障害物(パワーが必要),負の数:正の数
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

//ゲームの状態を管理する変数（現在のステージ番号、マップ、座標、パワー、歩数、履歴）
let idx=0,map=[],pos={x:0,y:0},pwr=0,step=0,his=[];

//ステージの初期化処理
function init(){
    console.log(`--- init stage: ${idx+1} ---`);
    const s=stages[idx];
    //マップをディープコピーして初期化
    map=JSON.parse(JSON.stringify(s.map));
    pwr=0;step=s.maxSteps;
    his=[];
    //スタート地点Pを探し、プレイヤーの初期座標を設定。その後Pは0に置換
    for(let y=0;y<map.length;y++){
        for(let x=0;x<map[y].length;x++){
            if(map[y][x]==='P'){
              pos={x,y};map[y][x]=0
            }
        }
    }
    upd(); //画面更新
}

//画面表示（DOM）の更新処理
function upd(){
    console.log(`upd -> pwr: ${pwr}, step: ${step}, pos: (${pos.x},${pos.y})`);
    //ステータス表示の更新
    document.getElementById('power-val').innerText=pwr;
    document.getElementById('step-val').innerText=step;
    document.getElementById('stage-num').innerText=idx+1;
    //歩数が少なくなったらアラート用のクラスを付与
    const sb=document.getElementById('step-container');
    sb.className=step<=3?'limit-alert':'';
    //マップの描画をリセットして再構築
    const c=document.getElementById('game-container');
    c.innerHTML='';
    map.forEach((row,y)=>{
        const rD=document.createElement('div');
        rD.className='row';
        row.forEach((cell,x)=>{
            const d=document.createElement('div');
            d.className='cell';
            //セルの種類（プレイヤー、ゴール、数字、空地）に応じてクラス分け
            if(x===pos.x&&y===pos.y){
              d.classList.add('player')
            }
            else if(cell==='G'){
              d.classList.add('goal')
            }
            else if(typeof cell==='number'&&cell!==0){
                const isM=cell>0;
                d.classList.add(isM?'minus':'plus');
                //表示上は負の数を+、正の数を-として反転表示
                d.innerText=(isM?'-':'+')+Math.abs(cell);
            }else{
              d.classList.add('empty')
            }
            rD.appendChild(d);
        });
        c.appendChild(rD);
    });
}

//移動処理
function mv(dx,dy){
    //歩数切れチェック
    if(step<=0){console.log("mv failed: no steps");return;}
    const nx=pos.x+dx,ny=pos.y+dy;
    //画面外チェック
    if(ny<0||ny>=map.length||nx<0||nx>=map[0].length){
      console.log("mv failed: out of bounds");
      return;
    }
    const t=map[ny][nx];
    console.log(`mv to: (${nx},${ny}), target: ${t}`);
    
    //ゴールの判定
    if(t==='G'){
        //クリア条件：マップ上の全数字を回収し、パワーをちょうど0にする
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
    
    //通常セルへの移動
    if(typeof t==='number'){
        // 正の数のセル（障害物）を通るには、その値以上のパワーが必要
        if(t>0&&pwr<t){
          console.log("mv failed: insufficient power");
          return;
        }
        //現在の状態を履歴に保存（アンドゥ用）
        his.push({map:JSON.parse(JSON.stringify(map)),pos:{...pos},pwr,step});
        //パワー計算、歩数減算、セルの消去、座標更新
        pwr-=t;step-=1;map[ny][nx]=0;pos={x:nx,y:ny};
        upd();
        
        //歩数0でのゲームオーバー判定
        if(step===0){
            setTimeout(()=>{
                const r=map.flat().filter(v=>typeof v==='number'&&v!==0).length;
                if(r>0||pwr!==0){console.log("game over: steps 0");alert("GAME OVER");}
            },100);
        }
    }
}

//1手戻る（アンドゥ）機能
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

//キーボードイベント
window.addEventListener('keydown',e=>{
    const k=e.key;
    if(k==='ArrowUp')mv(0,-1);
    if(k==='ArrowDown')mv(0,1);
    if(k==='ArrowLeft')mv(-1,0);
    if(k==='ArrowRight')mv(1,0);
    if(k==='r'||k==='R')init(); // Rキーでリセット
    if(k==='z'||k==='Z')undo(); // Zキーでアンドゥ
});

//ボタンクリックイベントの設定
document.getElementById('reset-btn').onclick=init;
document.getElementById('undo-btn').onclick=undo;

//最初の起動
init();

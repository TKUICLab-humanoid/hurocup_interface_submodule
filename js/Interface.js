var ros = new ROSLIB.Ros({
  url: "ws://172.17.121.10:9090"
});
ros.on('connection', function () {
  console.log('Connection made!');
  connectFlag = true;
  createTopics();
  resetfunction();
  document.body.style.backgroundImage = 'url(./picture/Background.jpg)';

  document.getElementById('resetButton').disabled = false;
  document.getElementById('connected').style.display = 'inline';
});
ros.on('error', function (error) {
  console.log('Error connecting to websocket server: ', error);
  document.getElementById('SaveButton').disabled = true;
  document.getElementById('ReadButton').disabled = true;
  document.getElementById('SaveStandButton').disabled = true;
  document.getElementById('ReadStandButton').disabled = true;
  document.getElementById('SendButton').disabled = true;
  document.getElementById('executeButton').disabled = true;
  document.getElementById('standButton').disabled = true;
  
  document.getElementById('MultipleButton').disabled = true;
  document.getElementById('MergeButton').disabled = true;
  document.getElementById('AddButton').disabled = true;
  document.getElementById('DeleteButton').disabled = true;
  document.getElementById('ReverseButton').disabled = true;
  document.getElementById('CopyButton').disabled = true;
  document.getElementById('CheckSumButton').disabled = true;
  document.getElementById('resetButton').disabled = true;
  document.getElementById('connected').style.display = 'none';
});
ros.on('close', function () {
  console.log('Connection to websocket server closed.');
  document.getElementById('SaveButton').disabled = true;
  document.getElementById('ReadButton').disabled = true;
  document.getElementById('SaveStandButton').disabled = true;
  document.getElementById('ReadStandButton').disabled = true;
  document.getElementById('SendButton').disabled = true;
  document.getElementById('executeButton').disabled = true;
  document.getElementById('standButton').disabled = true;
  
  document.getElementById('MultipleButton').disabled = true;
  document.getElementById('MergeButton').disabled = true;
  document.getElementById('AddButton').disabled = true;
  document.getElementById('DeleteButton').disabled = true;
  document.getElementById('ReverseButton').disabled = true;
  document.getElementById('CopyButton').disabled = true;
  document.getElementById('CheckSumButton').disabled = true;
  document.getElementById('resetButton').disabled = true;
  document.getElementById('connected').style.display = 'none';
});

var interface = new ROSLIB.Topic({
  ros: ros,
  name: '/package/InterfaceSend2Sector',
  messageType: 'tku_msgs/InterfaceSend2Sector'
});
var SendPackage = new ROSLIB.Message({
  package: 0,
  sectorname: ""
});


var SectorPackage = new ROSLIB.Topic({
  ros: ros,
  name: '/package/Sector',
  messageType: 'std_msgs/Int16'
});
var SendSectorPackage = new ROSLIB.Message({
  data : 0
});

var InterfaceSaveMotionData = new ROSLIB.Topic({
  ros: ros,
  name: '/package/InterfaceSaveMotion',
  messageType: 'tku_msgs/SaveMotion'
});
var SaveMotionData = new ROSLIB.Message({
    name: "",
    motionstate: 0,
    id: 0,
    savestate: 0,
    saveflag: false,
    motionlist: [0],
    motordata: [0]
});

//-----
var SendPackageCallBack = null;
var ExecuteCallBack = null;

var connectFlag = false;
var myAddress = "172.17.121.10";

var executeSubscribeFlag = false;
var standSubscribeFlag = false;

var doSendFlag = false;
var doExecuteFlag = false;
var doStandFlag = false;

var FirstSend = true;

function createTopics()
{
  console.log("createtopics");
  console.log(SendPackageCallBack);

  if(SendPackageCallBack != null)
  {
    SendPackageCallBack.unsubscribe();
  }
  SendPackageCallBack = new ROSLIB.Topic({
    ros: ros,
    name: '/package/motioncallback',
    messageType: 'std_msgs/Bool'
  });
  SendPackageCallBack.subscribe(function(msg)
  {
    sleep(200);//wait for motionpackage 1000/60 = 166
    console.log("SendPackageCallBack");
    if(msg.data == true)
    {
      CheckSector(Number(document.getElementById('Sector').value));
    }
    else if(msg.data == false)
    {
      document.getElementById('label').innerHTML = "Send sector is fail !! Please try again !!";
    }
  });

  if(ExecuteCallBack != null)
  {
    ExecuteCallBack.unsubscribe();
  }
  ExecuteCallBack = new ROSLIB.Topic({
    ros: ros,
    name: '/package/executecallback',
    messageType: 'std_msgs/Bool'
  });
  ExecuteCallBack.subscribe(function (msg)
  {
    if(msg.data == true)
    {
      if(executeSubscribeFlag == true)
      {
        document.getElementById('label').innerHTML = "Execute is finish !!";
        document.getElementById('stand_label').innerHTML = "not standing";
        document.getElementById('SaveButton').disabled = false;
        document.getElementById('ReadButton').disabled = false;
        document.getElementById('SaveStandButton').disabled = false;
        document.getElementById('ReadStandButton').disabled = false;
        document.getElementById('SendButton').disabled = false;
        document.getElementById('executeButton').disabled = false;
        document.getElementById('standButton').disabled = false;
        
        document.getElementById('MultipleButton').disabled = false;
        document.getElementById('MergeButton').disabled = false;
        document.getElementById('AddButton').disabled = false;
        document.getElementById('DeleteButton').disabled = false;
        document.getElementById('ReverseButton').disabled = false;
        document.getElementById('CopyButton').disabled = false;
        document.getElementById('CheckSumButton').disabled = false;
        executeSubscribeFlag = false;
      }
      else if(standSubscribeFlag == true)
      {
        document.getElementById('stand_label').innerHTML = "is standing";
        document.getElementById('standButton').disabled = false;
        
        standSubscribeFlag = false;
      }
    }
    else
    {
      if(executeSubscribeFlag == true)
      {
        document.getElementById('label').innerHTML = "Execute is fail !! Please try again !!";
        executeSubscribeFlag = false;
      }
      else if(standSubscribeFlag == true)
      {
        document.getElementById('label').innerHTML = "Stand is fail !! Please try again !!";
        standSubscribeFlag = false;
      }
    }
  });
}

function enterAddress() 
{
  if(connectFlag)
  {
    ros.close();
    connectFlag = false;
  }
  myAddress = document.getElementById("addressSelect").value;
  console.log("Connecting address is", myAddress);
  ros.connect("ws://" + myAddress + ":9090");
}

var location_strategy = new ROSLIB.Topic({
  ros: ros,
  name: '/location',
  messageType: 'tku_msgs/location'
});
var location_msg = new ROSLIB.Message({
  data: ""

});

function strategylocation() {
  // 获取选定的值
  location_msg.data = "/home/iclab/Desktop/humanoid/src/wula/wula/"+ document.getElementById('strategy_location').value + "/Parameter";
  console.log(`Selected strategy location: ${location_msg.data}`);
  location_strategy.publish(location_msg);

}


function sleep(ms)
{
  var starttime = new Date().getTime();
  do{

  }while((new Date().getTime() - starttime) < ms)
}

function createTopicsDRC() {
  if(SensorPackage_Subscriber != null)
  {
    SensorPackage_Subscriber.unsubscribe();
  }
  var SensorPackage_Subscriber = new ROSLIB.Topic({
  ros: ros,
  name: '/package/sensorpackage',
  messageType: 'tku_msgs/SensorPackage'
  });
  SensorPackage_Subscriber.subscribe(function (msg)
  {		
    document.getElementById("Roll").value = msg.x;
    document.getElementById("Pitch").value = msg.y;
    document.getElementById("Yaw").value = msg.z;
  });
  if(SendPackageCallBack != null)
  {
    SendPackageCallBack.unsubscribe();
  }
  SendPackageCallBack = new ROSLIB.Topic({
    ros: ros,
    name: '/package/motioncallback',
    messageType: 'std_msgs/Bool'
  });
  SendPackageCallBack.subscribe(function(msg)
  {
    sleep(200);//wait for motionpackage 1000/60 = 166
    console.log("SendPackageCallBack");
    if(msg.data == true)
    {
      CheckSector(Number(document.getElementById('Sector').value));
    }
    else if(msg.data == false)
    {
      document.getElementById('label').innerHTML = "Send sector is fail !! Please try again !!";
    }
  });

  if(ExecuteCallBack != null)
  {
    ExecuteCallBack.unsubscribe();
  }
  ExecuteCallBack = new ROSLIB.Topic({
    ros: ros,
    name: '/package/executecallback',
    messageType: 'std_msgs/Bool'
  });
  ExecuteCallBack.subscribe(function (msg)
  {
    if(msg.data == true)
    {
      if(executeSubscribeFlag == true)
      {
        executeSubscribeFlag = false;
        console.log("execute~")
      }
      else if(standSubscribeFlag == true)
      {
        standSubscribeFlag = false;
        console.log("stand~")
      }
    }
    else
    {
      if(executeSubscribeFlag == true)
      {
        executeSubscribeFlag = false;
        console.log("execute finish")
      }
      else if(standSubscribeFlag == true)
      {
        standSubscribeFlag = false;
        console.log("stand finish")
      }
    }
  });
}

function CheckSectorDRC(sectordata)
{
  console.log(sectordata)
  var LoadParameterClient = new ROSLIB.Service({
    ros : ros,
    name : '/package/InterfaceCheckSector',
    serviceType: 'tku_msgs/CheckSector'
  });
  var parameter_request = new ROSLIB.ServiceRequest({
    data : sectordata
  });
  LoadParameterClient.callService(parameter_request , function(srv)
  {
    console.log("CheckSector");
    executeSubscribeFlag = false;
    standSubscribeFlag = false;
    if(srv.checkflag == true)
    {
      if(doSendFlag == true)
      {
        doSendFlag = false;
      }
      else if(doExecuteFlag == true)
      {
        SendSectorPackage.data = sectordata;
        SectorPackage.publish(SendSectorPackage);

        doExecuteFlag = false;
        executeSubscribeFlag = true;
      }
      else if(doStandFlag == true)
      {
        SendSectorPackage.data = sectordata;
        SectorPackage.publish(SendSectorPackage);
        
        doStandFlag = false;
        standSubscribeFlag = true;
      }
    }
    else
    {
      if(doSendFlag == true)
      {
        doSendFlag = false;
      }
      else if(doExecuteFlag == true)
      {
        doExecuteFlag = false;
      }
      else if(doStandFlag == true)
      {
        doStandFlag = false;
      }
    }
  });
}

function standDRC()
{
  doStandFlag = true;
  console.log("stand");

  CheckSector(29);
}

function executeDRC(motion)
{
  console.log("execute");
  doExecuteFlag = true;
  if(motion == "motion1")
  {
    CheckSectorDRC(Number(document.getElementById('Sector1').value));
    console.log("1")
    sleep(100)
  }
  else if(motion == "motion2")
  {
    CheckSectorDRC(Number(document.getElementById('Sector2').value));
    console.log("2")
    sleep(100)
  }
  else if(motion == "motion3")
  {
    CheckSectorDRC(Number(document.getElementById('Sector3').value));
    console.log("3")
    sleep(100)
  }
  
}

function CheckSector(sectordata)
{
  console.log("bbbbbbbbbbbbbbbbbb");
  var LoadParameterClient = new ROSLIB.Service({
    ros : ros,
    name : '/package/InterfaceCheckSector',
    serviceType: 'tku_msgs/CheckSector'
  });
  var parameter_request = new ROSLIB.ServiceRequest({
    data : sectordata
  });
  console.log(LoadParameterClient);
  console.log(sectordata);
  // SendSectorPackage.data = sectordata;
  // SectorPackage.publish(SendSectorPackage);

  LoadParameterClient.callService(parameter_request , function(srv)
  {
    console.log("CheckSector");
    console.log(srv.checkflag);
    console.log(doSendFlag);
    console.log(doExecuteFlag);

    executeSubscribeFlag = false;
    standSubscribeFlag = false;
    if(srv.checkflag == true)
    {
      if(doSendFlag == true)
      {
        document.getElementById('label').innerHTML = "Send sector is successful !!";
        document.getElementById('SaveButton').disabled = false;
        document.getElementById('ReadButton').disabled = false;
        document.getElementById('SaveStandButton').disabled = false;
        document.getElementById('ReadStandButton').disabled = false;
        document.getElementById('executeButton').disabled = false;
        document.getElementById('standButton').disabled = false;
        
        document.getElementById('MultipleButton').disabled = false;
        document.getElementById('MergeButton').disabled = false;
        document.getElementById('AddButton').disabled = false;
        document.getElementById('DeleteButton').disabled = false;
        document.getElementById('ReverseButton').disabled = false;
        document.getElementById('CopyButton').disabled = false;
        document.getElementById('CheckSumButton').disabled = false;
        doSendFlag = false;
      }
      else if(doExecuteFlag == true)
      {
        SendSectorPackage.data = sectordata;
        SectorPackage.publish(SendSectorPackage);

        doExecuteFlag = false;
        executeSubscribeFlag = true;
      }
      else if(doStandFlag == true)
      {
        console.log("stand");
        SendSectorPackage.data = sectordata;
        SectorPackage.publish(SendSectorPackage);
        
        doStandFlag = false;
        standSubscribeFlag = true;
      }
    }
    else
    {
      if(doSendFlag == true)
      {
        document.getElementById('label').innerHTML = "Sector is not correct !! Please try again !!";
        doSendFlag = false;
      }
      else if(doExecuteFlag == true)
      {
        console.log("execute");
        document.getElementById('label').innerHTML = "Sector is not correct !! Please check your sector file !!";
        document.getElementById('SaveButton').disabled = false;
        document.getElementById('ReadButton').disabled = false;
        document.getElementById('SaveStandButton').disabled = false;
        document.getElementById('ReadStandButton').disabled = false;
        document.getElementById('SendButton').disabled = false;
        document.getElementById('executeButton').disabled = false;
        document.getElementById('standButton').disabled = false;
        
        document.getElementById('MultipleButton').disabled = false;
        document.getElementById('MergeButton').disabled = false;
        document.getElementById('AddButton').disabled = false;
        document.getElementById('DeleteButton').disabled = false;
        document.getElementById('ReverseButton').disabled = false;
        document.getElementById('CopyButton').disabled = false;
        document.getElementById('CheckSumButton').disabled = false;
        doExecuteFlag = false;
      }
      else if(doStandFlag == true)
      {
        document.getElementById('label').innerHTML = "Sector is not correct !! Please check your sector file !!";
        document.getElementById('standButton').disabled = false;
        
        doStandFlag = false;
      }
    }
  });

}

function Save()
{
  SaveMotionData.savestate = 0;
  SaveMotionData.name = document.getElementById('filename').value;
  for(var i = 0;i < document.getElementById('MotionTable').getElementsByTagName('div').length;i+=2)
  {
    SaveMotionData.motionstate = 0;
    SaveMotionData.id = Number(document.getElementById('MotionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
    for(var j = 0; j < 40; j++)
    {
      SaveMotionData.motionlist[j] = Number(document.getElementById('MotionTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
    }
    InterfaceSaveMotionData.publish(SaveMotionData);
  }

  for(var i = 0;i < document.getElementById('RelativePositionTable').getElementsByTagName('div').length;i+=2)
  {
    SaveMotionData.motionstate = 1;
    SaveMotionData.id = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
    for(var j = 0; j < 26; j++)
    {
      SaveMotionData.motordata[j] = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
    }

    InterfaceSaveMotionData.publish(SaveMotionData);
    SaveMotionData.motionstate = 2;
    SaveMotionData.id = Number(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
    for(var j = 0; j < 26; j++)
    {
      SaveMotionData.motordata[j] = Number(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
    }
    InterfaceSaveMotionData.publish(SaveMotionData);
  }
  
  for(var i = 0;i < document.getElementById('AbsolutePositionTable').getElementsByTagName('div').length;i+=2)
  {
    SaveMotionData.motionstate = 3;
    SaveMotionData.id = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
    for(var j = 0; j < 26; j++)
    {
      SaveMotionData.motordata[j] = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
    }
    InterfaceSaveMotionData.publish(SaveMotionData);
    SaveMotionData.motionstate = 4;
    SaveMotionData.id = Number(document.getElementById('AbsoluteSpeedTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
    for(var j = 0; j < 26; j++)
    {
      SaveMotionData.motordata[j] = Number(document.getElementById('AbsoluteSpeedTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
    }
    InterfaceSaveMotionData.publish(SaveMotionData);
  }
  SaveMotionData.saveflag = true;
  InterfaceSaveMotionData.publish(SaveMotionData);
  SaveMotionData.saveflag = false;
  document.getElementById('label').innerHTML = "Save file is successful !!";
}

function Read()
{
  var LoadParameterClient = new ROSLIB.Service({
    ros : ros,
    name : '/package/InterfaceReadSaveMotion',
    serviceType: 'tku_msgs/ReadMotion'
  });
  var parameter_request = new ROSLIB.ServiceRequest({
    read : true,
    name : document.getElementById('filename').value,
    readstate : 0
  });
  LoadParameterClient.callService(parameter_request , function(MotionData)
  {
    var motionlistcnt = 0;
    var relativepositioncnt = 0;
    var relativespeedcnt = 0;
    var absolutepositioncnt = 0;
    var absolutespeedcnt = 0;
    for(var i = 0; i < MotionData.vectorcnt; i++)
    {
      switch(MotionData.motionstate[i])
      {
        case 0:
          NewMotionList();
          document.getElementById('MotionTable').getElementsByTagName('div')[motionlistcnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
          for(var j = 0; j < 40; j++)
          {
            document.getElementById('MotionTable').getElementsByTagName('div')[motionlistcnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.motionlist[motionlistcnt*40+j];
            
          }
          motionlistcnt++;
          break;
        case 1:
          NewRelativePosition();
          document.getElementById('RelativePositionTable').getElementsByTagName('div')[relativepositioncnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
          for(var j = 0; j < 26; j++)
          {
            document.getElementById('RelativePositionTable').getElementsByTagName('div')[relativepositioncnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.relativedata[relativepositioncnt*26+relativespeedcnt*26+j];
          }
          relativepositioncnt++;
          break;
        case 2:
          NewRelativeSpeed();
          document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[relativespeedcnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
          for(var j = 0; j < 26; j++)
          {
            document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[relativespeedcnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.relativedata[relativepositioncnt*26+relativespeedcnt*26+j];
          }
          relativespeedcnt++;
          break;
        case 3:
          NewAbsolutePosition();
          document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[absolutepositioncnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
          for(var j = 0; j < 26; j++)
          {
            document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[absolutepositioncnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.absolutedata[absolutepositioncnt*26+absolutespeedcnt*26+j];
          }
          absolutepositioncnt++;
          break;
        case 4:
          NewAbsoluteSpeed();
          document.getElementById('AbsoluteSpeedTable').getElementsByTagName('div')[absolutespeedcnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
          for(var j = 0; j < 26; j++)
          {
            document.getElementById('AbsoluteSpeedTable').getElementsByTagName('div')[absolutespeedcnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.absolutedata[absolutepositioncnt*26+absolutespeedcnt*26+j];
          }
          absolutespeedcnt++;
          break;
      }
    }
	  document.getElementById('label').innerHTML = "Read file is successful !!";
  });
}

// function SaveStand()
// {
//   SaveMotionData.savestate = 1;
//   SaveMotionData.name = document.getElementById('filename').value;
//   for(var i = 0;i < document.getElementById('MotionTable').getElementsByTagName('div').length;i+=2)
//   {
//     SaveMotionData.motionstate = 0;
//     SaveMotionData.id = Number(document.getElementById('MotionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
//     for(var j = 0; j < 40; j++)
//     {
//       SaveMotionData.motionlist[j] = Number(document.getElementById('MotionTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
//     }
//     InterfaceSaveMotionData.publish(SaveMotionData);
//   }
  
//   for(var i = 0;i < document.getElementById('RelativePositionTable').getElementsByTagName('div').length;i+=2)
//   {
//     SaveMotionData.motionstate = 1;
//     SaveMotionData.id = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
//     for(var j = 0; j < 26; j++)
//     {
//       SaveMotionData.motordata[j] = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
//     }
//     InterfaceSaveMotionData.publish(SaveMotionData);
//     SaveMotionData.motionstate = 2;
//     SaveMotionData.id = Number(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
//     for(var j = 0; j < 26; j++)
//     {
//       SaveMotionData.motordata[j] = Number(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
//     }
//     InterfaceSaveMotionData.publish(SaveMotionData);
//   }
  
//   for(var i = 0;i < document.getElementById('AbsolutePositionTable').getElementsByTagName('div').length;i+=2)
//   {
//     SaveMotionData.motionstate = 3;
//     SaveMotionData.id = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
//     for(var j = 0; j < 26; j++)
//     {
//       SaveMotionData.motordata[j] = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
//     }
//     InterfaceSaveMotionData.publish(SaveMotionData);
//     SaveMotionData.motionstate = 4;
//     SaveMotionData.id = Number(document.getElementById('AbsoluteSpeedTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value);
//     for(var j = 0; j < 26; j++)
//     {
//       SaveMotionData.motordata[j] = Number(document.getElementById('AbsoluteSpeedTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j+1].value);
//     }
//     InterfaceSaveMotionData.publish(SaveMotionData);
//   }
//   SaveMotionData.saveflag = true;
//   InterfaceSaveMotionData.publish(SaveMotionData);
//   SaveMotionData.saveflag = false;
//   document.getElementById('label').innerHTML = "SaveStand file is successful !!";
// }

function SaveStand() {
  // 1. 取得檔名，若空則預設 'untitled'
  const fileNameInput = document.getElementById('filename').value.trim();
  const fileName = fileNameInput !== '' ? fileNameInput : 'untitled';

  // 快速取得各組 DIV list
  const motionDivs    = document.getElementById('MotionTable'           ).getElementsByTagName('div');
  const relPosDivs    = document.getElementById('RelativePositionTable').getElementsByTagName('div');
  const relSpdDivs    = document.getElementById('RelativeSpeedTable'   ).getElementsByTagName('div');
  const absPosDivs    = document.getElementById('AbsolutePositionTable').getElementsByTagName('div');
  const absSpdDivs    = document.getElementById('AbsoluteSpeedTable'   ).getElementsByTagName('div');

  // Helper：建立一個乾淨的 Message 物件
  function makeMsg({ saveflag=false, savestate=1, motionstate=0, id=0 }) {
    return new ROSLIB.Message({
      name:        fileName,
      savestate:   savestate,
      saveflag:    saveflag,
      motionstate: motionstate,
      id:          id,
      motionlist:  [],   // int16[]
      motordata:   []    // int16[]
    });
  }

  // 2. MotionTable：state=0, length=40
  for (let i = 0; i < motionDivs.length; i += 2) {
    const id = Number(motionDivs[i].getElementsByClassName('textbox')[0].value) || 0;
    const msg = makeMsg({ savestate: 1, motionstate: 0, id: id });

    const cells = motionDivs[i+1].getElementsByClassName('textbox');
    for (let j = 1; j <= 40; j++) {
      const v = Number(cells[j].value);
      msg.motionlist.push(isNaN(v) ? 0 : v);
    }
    InterfaceSaveMotionData.publish(msg);
  }

  // 3. Relative：pos state=1, spd state=2, length=26
  for (let i = 0; i < relPosDivs.length; i += 2) {
    // position
    const idPos = Number(relPosDivs[i].getElementsByClassName('textbox')[0].value) || 0;
    const msgPos = makeMsg({ savestate: 1, motionstate: 1, id: idPos });
    const posCells = relPosDivs[i+1].getElementsByClassName('textbox');
    for (let j = 1; j <= 26; j++) {
      const v = Number(posCells[j].value);
      msgPos.motordata.push(isNaN(v) ? 0 : v);
    }
    InterfaceSaveMotionData.publish(msgPos);

    // speed
    const idSpd = Number(relSpdDivs[i].getElementsByClassName('textbox')[0].value) || 0;
    const msgSpd = makeMsg({ savestate: 1, motionstate: 2, id: idSpd });
    const spdCells = relSpdDivs[i+1].getElementsByClassName('textbox');
    for (let j = 1; j <= 26; j++) {
      const v = Number(spdCells[j].value);
      msgSpd.motordata.push(isNaN(v) ? 0 : v);
    }
    InterfaceSaveMotionData.publish(msgSpd);
  }

  // 4. Absolute：pos state=3, spd state=4, length=26
  for (let i = 0; i < absPosDivs.length; i += 2) {
    // position
    const idPosA = Number(absPosDivs[i].getElementsByClassName('textbox')[0].value) || 0;
    const msgPosA = makeMsg({ savestate: 1, motionstate: 3, id: idPosA });
    const posACells = absPosDivs[i+1].getElementsByClassName('textbox');
    for (let j = 1; j <= 26; j++) {
      const v = Number(posACells[j].value);
      msgPosA.motordata.push(isNaN(v) ? 0 : v);
    }
    InterfaceSaveMotionData.publish(msgPosA);

    // speed
    const idSpdA = Number(absSpdDivs[i].getElementsByClassName('textbox')[0].value) || 0;
    const msgSpdA = makeMsg({ savestate: 1, motionstate: 4, id: idSpdA });
    const spdACells = absSpdDivs[i+1].getElementsByClassName('textbox');
    for (let j = 1; j <= 26; j++) {
      const v = Number(spdACells[j].value);
      msgSpdA.motordata.push(isNaN(v) ? 0 : v);
    }
    InterfaceSaveMotionData.publish(msgSpdA);
  }

  // 5. 最後一筆：帶 saveflag=true，觸發後端寫檔
  const doneMsg = makeMsg({ saveflag: true, savestate: 1, motionstate: 0, id: 0 });
  InterfaceSaveMotionData.publish(doneMsg);

  // 6. UI 回饋
  document.getElementById('label').innerHTML = "SaveStand file is successful !!";
}



function ReadStand()
{
  console.log("ReadStand");
  var LoadParameterClient = new ROSLIB.Service({
    ros : ros,
    name : '/package/InterfaceReadSaveMotion',
    serviceType: 'tku_msgs/ReadMotion'
  });
  var filename = document.getElementById('filename').value;
  var parameter_request = new ROSLIB.ServiceRequest({
    read : true,
    name : filename,
    readstate : 1
  });
  console.log("Reading file: " + filename);  // Log the filename
  LoadParameterClient.callService(parameter_request , function(MotionData){
    var motionlistcnt = 0;
    var relativepositioncnt = 0;
    var relativespeedcnt = 0;
    var absolutepositioncnt = 0;
    var absolutespeedcnt = 0;
    console.log(MotionData.motionstate);
    console.log(MotionData.vectorcnt);
    console.log(MotionData.id)
    console.log(MotionData.readcheck);
    if (MotionData.readcheck == false)
    {
      console.log("ReadStand file is fail !!");
      document.getElementById('label').innerHTML = "ReadStand file is fail !! Please try again !!";
      return;
    }
    else if (MotionData.readcheck == true)
    {
      console.log("ReadStand file is successful !!");
      for(var i = 0; i < MotionData.vectorcnt; i++)
      {
        console.log(MotionData.motionstate);

        switch(MotionData.motionstate[i])
        {
          case 0:
            NewMotionList();
            console.log(MotionData.id[i]);
            document.getElementById('MotionTable').getElementsByTagName('div')[motionlistcnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
            for(var j = 0; j < 40; j++)
            {
              document.getElementById('MotionTable').getElementsByTagName('div')[motionlistcnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.motionlist[motionlistcnt*40+j];
            }
            console.log(MotionData.motionlist);
            motionlistcnt++;
            break;
          case 1:
            NewRelativePosition();
            
            console.log(MotionData.id[i]);
            document.getElementById('RelativePositionTable').getElementsByTagName('div')[relativepositioncnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
            for(var j = 0; j < 26; j++)
            {
              document.getElementById('RelativePositionTable').getElementsByTagName('div')[relativepositioncnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.relativedata[relativepositioncnt*26+relativespeedcnt*26+j];
            }
            console.log(MotionData.relativedata)
            relativepositioncnt++;
            break;
          case 2:
            NewRelativeSpeed(); 
            console.log(MotionData.id[i]);
            document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[relativespeedcnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
            for(var j = 0; j < 26; j++)
            {
              document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[relativespeedcnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.relativedata[relativepositioncnt*26+relativespeedcnt*26+j];
            }
            console.log(MotionData.relativedata)
            relativespeedcnt++;
            break;
          case 3:
            NewAbsolutePosition();
            console.log(MotionData.id[i]);
            document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[absolutepositioncnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
            for(var j = 0; j < 26; j++)
            {
              document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[absolutepositioncnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.absolutedata[absolutepositioncnt*26+absolutespeedcnt*26+j];
            }
            absolutepositioncnt++;
            break;
          case 4:
            NewAbsoluteSpeed();
            console.log(MotionData.id[i]);
            document.getElementById('AbsoluteSpeedTable').getElementsByTagName('div')[absolutespeedcnt*2].getElementsByClassName('textbox')[0].value = MotionData.id[i];
            for(var j = 0; j < 26; j++)
            {
              document.getElementById('AbsoluteSpeedTable').getElementsByTagName('div')[absolutespeedcnt*2+1].getElementsByClassName('textbox')[j+1].value = MotionData.absolutedata[absolutepositioncnt*26+absolutespeedcnt*26+j];
            }
            absolutespeedcnt++;
            break;
        }
      }
      document.getElementById('label').innerHTML = "ReadStand file is successful !!";
    }
  });
}

function Send()
{
  doSendFlag = true;
  document.getElementById('label').innerHTML = "";
  document.getElementById('SaveButton').disabled = true;
  document.getElementById('ReadButton').disabled = true;
  document.getElementById('SaveStandButton').disabled = true;
  document.getElementById('ReadStandButton').disabled = true;
  document.getElementById('executeButton').disabled = true;
  document.getElementById('standButton').disabled = true;
  
  document.getElementById('MultipleButton').disabled = true;
  document.getElementById('MergeButton').disabled = true;
  document.getElementById('AddButton').disabled = true;
  document.getElementById('DeleteButton').disabled = true;
  document.getElementById('ReverseButton').disabled = true;
  document.getElementById('CopyButton').disabled = true;
  document.getElementById('CheckSumButton').disabled = true;
  var MotionList = [];
  var ID = Number(document.getElementById('SendID').value);
  var Sector = Number(document.getElementById('Sector').value);
  var count = 0;
  SendPackage.sectorname = document.getElementById('Sector').value;
  MotionList[count++] = 83;
  MotionList[count++] = 84;
  if (document.getElementById('Locked29').checked && Sector == 29)
  {
    alert("Sector 29 is Locked. Please try again. ");
  }
  else if (Sector < 1)
  {
    alert("Sector is not find. Please try again. ");
  }
  else
  {
    for (let i = 0; i < document.getElementById('AbsolutePositionTable')
                          .getElementsByTagName('div').length; i++) {
      // 取出這一列的 ID
      const rowId = Number(
        document.getElementById('AbsolutePositionTable')
                .getElementsByTagName('div')[i]
                .getElementsByClassName('textbox')[0]
                .value
      );

      if (ID === rowId) {
        // 根據 Lockedstand 決定指令碼
        const opcode = document.getElementById('Lockedstand').checked ? 242 : 241;
        MotionList.push(opcode);

        // 讀 26 顆馬達的速度和位置
        for (let j = 0; j < 26; j++) {
          const speed = Number(
            document.getElementById('AbsoluteSpeedTable')
                    .getElementsByTagName('div')[i + 1]
                    .getElementsByClassName('textbox')[j + 1]
                    .value
          );
          const pos = Number(
            document.getElementById('AbsolutePositionTable')
                    .getElementsByTagName('div')[i + 1]
                    .getElementsByClassName('textbox')[j + 1]
                    .value
          );
          // 直接 push 16-bit 整數
          MotionList.push(speed, pos);
        }

        // 加上尾標 N(78), E(69)
        MotionList.push(78, 69);

        console.log("242 publish start, length =", MotionList.length);
        // 逐 byte 發送（如果後端改成接 16-bit 就可以一次發 array 了）
        for (const b of MotionList) {
          SendPackage.package = b;
          interface.publish(SendPackage);
          console.log(b);
          sleep(2);
        }
        console.log("242 publish end");

        break;  // 找到後結束外層迴圈
      }
    }

    // RelativePositionTable / RelativeSpeedTable
    for (let i = 0; i < document
      .getElementById('RelativePositionTable')
      .getElementsByTagName('div').length; i += 2) {
      // 讀這一列的 ID
      const rowId = Number(
        document.getElementById('RelativePositionTable')
                .getElementsByTagName('div')[i]
                .getElementsByClassName('textbox')[0]
                .value
      );
      if (ID === rowId) {
        // opcode 固定 243
        MotionList.push(243);

        // 26 顆馬達的 speed + pos
        for (let j = 0; j < 26; j++) {
          const speed = Number(
            document.getElementById('RelativeSpeedTable')
                    .getElementsByTagName('div')[i + 1]
                    .getElementsByClassName('textbox')[j + 1]
                    .value
          );
          const pos = Number(
            document.getElementById('RelativePositionTable')
                    .getElementsByTagName('div')[i + 1]
                    .getElementsByClassName('textbox')[j + 1]
                    .value
          );
          MotionList.push(speed, pos);
        }

        // 尾標 N(78), E(69)
        MotionList.push(78, 69);

        console.log("243 publish start, length =", MotionList.length);
        for (const b of MotionList) {
          SendPackage.package = b;
          interface.publish(SendPackage);
          console.log(b);
          sleep(2);
        }
        console.log("243 publish end");
        break;
      }
    }
    // for (var i = 0; i < document.getElementById('RelativePositionTable').getElementsByTagName('div').length; i++) 
    // {
    //   if (ID == document.getElementById('RelativePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value) 
    //   {
    //     MotionList[count++] = 243;
    //     for (var j = 0; j < 26; j++) 
    //     {
    //       MotionList[count] = (Number(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[i + 1].getElementsByClassName('textbox')[j + 1].value)) & 0xff;
    //       checksum += MotionList[count];
    //       count++;
    //       MotionList[count] = (((Number(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[i + 1].getElementsByClassName('textbox')[j + 1].value)) >> 8) & 0xff);
    //       checksum += MotionList[count];
    //       count++;
    //       if (Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i + 1].getElementsByClassName('textbox')[j + 1].value) >= 0) 
    //       {
    //         MotionList[count] = (Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i + 1].getElementsByClassName('textbox')[j + 1].value)) & 0xff;
    //         checksum += MotionList[count];
    //         count++;
    //         MotionList[count] = (((Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i + 1].getElementsByClassName('textbox')[j + 1].value)) >> 8) & 0xff);
    //         checksum += MotionList[count];
    //         count++;
    //       }
    //       else if (Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i + 1].getElementsByClassName('textbox')[j + 1].value) < 0) 
    //       {
    //         var x = ~(Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i + 1].getElementsByClassName('textbox')[j + 1].value)) + 1;
    //         MotionList[count] = x & 0xff;
    //         checksum += MotionList[count];
    //         count++;
    //         MotionList[count] = ((x >> 8) & 0xff) | 0x80;
    //         checksum += MotionList[count];
    //         count++;
    //       }
    //       if (j < 4) 
    //       {
    //         checksum_Lhand = checksum;
    //       }
    //       else if (j < 8) 
    //       {
    //         checksum_Rhand = checksum - checksum_Lhand;
    //       }
    //       else if (j < 15) 
    //       {
    //         checksum_Lfoot = checksum - checksum_Lhand - checksum_Rhand;

    //       }
    //       else 
    //       {
    //         checksum_Rfoot = checksum - checksum_Lhand - checksum_Rhand - checksum_Lfoot;
    //       }
    //     }
    //     MotionList[count++] = checksum_Lhand & 0xff;
    //     MotionList[count++] = checksum_Rhand & 0xff;
    //     MotionList[count++] = checksum_Lfoot & 0xff;
    //     MotionList[count++] = checksum_Rfoot & 0xff;
    //     MotionList[count++] = count - 7;
    //     MotionList[count++] = 78;
    //     MotionList[count] = 69;
		//     console.log("243 publish start");
		//     console.log(MotionList.length);
    //     for (var a = 0; a < MotionList.length; a++) 
    //     {
    //       SendPackage.package = MotionList[a];
    //       interface.publish(SendPackage);
    //       console.log(SendPackage.package);
    //       sleep(2);
    //     }
		//     console.log("243 publish end");
    //     break;
    //   }   
    // }

    for (var i = 0; i < document.getElementById('MotionTable').getElementsByTagName('div').length; i++) 
    {
      if (ID == document.getElementById('MotionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value) 
      {
        MotionList[count++] = 244;
        for (var j = 1; j <= 20; j++) 
        {
          if (Number(document.getElementById('MotionTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j*2 - 1].value)) 
          {
            for (var l = 0; l < document.getElementById('RelativePositionTable').getElementsByTagName('div').length; l++) 
            {
              if (Number(document.getElementById('MotionTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[j*2 -1].value) == Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[l].getElementsByClassName('textbox')[0].value)) 
              {
                for (var k = 0; k < 26; k++) 
                {
                  MotionList[count++] = (Number(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[l + 1].getElementsByClassName('textbox')[k + 1].value)) & 0xff;
                  MotionList[count++] = (((Number(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[l + 1].getElementsByClassName('textbox')[k + 1].value)) >> 8) & 0xff);
                  if (Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[l + 1].getElementsByClassName('textbox')[k + 1].value) >= 0) 
                  {
                    MotionList[count++] = (Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[l + 1].getElementsByClassName('textbox')[k + 1].value)) & 0xff;
                    MotionList[count++] = (((Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[l + 1].getElementsByClassName('textbox')[k + 1].value)) >> 8) & 0xff);
                  }
                  else if (Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[l + 1].getElementsByClassName('textbox')[k + 1].value) < 0) 
                  {
                    var x = ~(Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[l + 1].getElementsByClassName('textbox')[k + 1].value)) + 1;
                    MotionList[count++] = x & 0xff;
                    MotionList[count++] = ((x >> 8) & 0xff) | 0x80;
                  }
                }
                MotionList[count++] = 68;
                MotionList[count++] = 89;
                MotionList[count++] = Number(document.getElementById('MotionTable').getElementsByTagName('div')[i + 1].getElementsByClassName('textbox')[j * 2].value);
                break;
              }
            }
          }
        }
        if(document.getElementById('MotionTable').getElementsByTagName('div')[i+1].getElementsByClassName('textbox')[1].value != 0)
        {
          MotionList[count++] = 69; //finish big motion
          MotionList[count++] = 78; //finish big motion
          MotionList[count++] = count - 3;
          MotionList[count++] = 78;
          MotionList[count] = 69;
          console.log("244 publish start");
          console.log(MotionList.length);
          for (var a = 0; a < MotionList.length; a++) 
          {
            SendPackage.package = MotionList[a];
            interface.publish(SendPackage);
            console.log(SendPackage.package);
            sleep(2);
          }
          console.log("244 publish end");
          break;
        }
        else
        {
          document.getElementById('label').innerHTML = "A1 or MotionList should not be empty";
        }
      }
    }
  }
  
  MotionList.length = 0;
}

function Locked()
{
  if (!document.getElementById('Locked29').checked)
  {
    document.getElementById('label').innerHTML = "Sector 29 is Unlocked";
  }
  else if (document.getElementById('Locked29').checked)
  {
    document.getElementById('label').innerHTML = "Sector 29 is Locked";
  }
}

function Locked2()
{
  if (!document.getElementById('Lockedstand').checked)
  {
    document.getElementById('label').innerHTML = "Stand Unlocked";
  }
  else if (document.getElementById('Lockedstand').checked)
  {
    document.getElementById('label').innerHTML = "Stand Locked";
  }
}

function execute()
{
  doExecuteFlag = true;
  document.getElementById('label').innerHTML = "";
  document.getElementById('SaveButton').disabled = true;
  document.getElementById('ReadButton').disabled = true;
  document.getElementById('SaveStandButton').disabled = true;
  document.getElementById('ReadStandButton').disabled = true;
  document.getElementById('SendButton').disabled = true;
  document.getElementById('executeButton').disabled = true;
  document.getElementById('standButton').disabled = true;
  
  document.getElementById('MultipleButton').disabled = true;
  document.getElementById('MergeButton').disabled = true;
  document.getElementById('AddButton').disabled = true;
  document.getElementById('DeleteButton').disabled = true;
  document.getElementById('ReverseButton').disabled = true;
  document.getElementById('CopyButton').disabled = true;
  document.getElementById('CheckSumButton').disabled = true;
  console.log("23232323232323")
  CheckSector(Number(document.getElementById('Sector').value));
}

function stand()
{
  console.log("aaaaaaaaaaaaaaaaaaaaaaaaa")
  doStandFlag = true;
  document.getElementById('label').innerHTML = "";
  document.getElementById('standButton').disabled = true;
  
  console.log(doStandFlag)

  CheckSector(29);
}


function resetfunction()
{
  document.getElementById('label').innerHTML = "";
  document.getElementById('SaveButton').disabled = false;
  document.getElementById('ReadButton').disabled = false;
  document.getElementById('SaveStandButton').disabled = false;
  document.getElementById('ReadStandButton').disabled = false;
  document.getElementById('SendButton').disabled = false;
  document.getElementById('executeButton').disabled = false;
  document.getElementById('standButton').disabled = false;
  
  document.getElementById('MultipleButton').disabled = false;
  document.getElementById('MergeButton').disabled = false;
  document.getElementById('AddButton').disabled = false;
  document.getElementById('DeleteButton').disabled = false;
  document.getElementById('ReverseButton').disabled = false;
  document.getElementById('CopyButton').disabled = false;
  document.getElementById('CheckSumButton').disabled = false;
}

function addreduce(value)
{
  var addreduce = value;
  console.log(addreduce);
  var chooseID=document.getElementById("chooseID").value;
  var resetID=document.getElementById("resetID").value;
  var n=0;
  var numflag=false;
  var Motorflag = false;
  if(document.getElementById("RelativePosition").style.display == "initial")
  {
    console.log("RelativePosition");
    for(var i = 0; i < document.getElementById('RelativePositionTable').getElementsByTagName('div').length; i += 2)
	  {
      if(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value == chooseID)
	    {
        n = i;
        numflag = true;
        break;
      }  
    }
    if(resetID>26 || resetID<1)
    {
      numflag = false;
      Motorflag = true;
    }
    if(numflag == true)
	  {
      switch(addreduce)
      {
        case "add_5":
          var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value + 5;
          break;
        case "add_10":
          var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value + 10;
          break;
        case "add_100":
          var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value + 100;
          break;
        case "reduce_5":
          var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value - 5;
          break;
        case "reduce_10":
          var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value - 10;
          break;
        case "reduce_100":
          var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value - 100;
          break;
        case "resetmotor":
          var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = 2048;
          break;
        default:
          var getvalue = Number(document.getElementById('addvalue').value);
          var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = getvalue + value;
          break;
      }
      document.getElementById('label').innerHTML = "add & reduce is successful !!";
    }
    else
	  {
      if(Motorflag)
      {
        document.getElementById('label').innerHTML = "No this MotorID !!";
      }
      else
      {
        document.getElementById('label').innerHTML = "add & reduce is fail !! No this ID !!";
      }
    }
  }
  else if(document.getElementById("AbsolutePosition").style.display == "initial") 
  {
    console.log("AbsolutePositionTable");
    for(var i = 0; i < document.getElementById('AbsolutePositionTable').getElementsByTagName('div').length; i += 2)
	  {
      if(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value == chooseID)
	    {
        n = i;
        numflag = true;
        break;
      }  
    }
    if(resetID>26 || resetID<1)
    {
      numflag = false;
      Motorflag = true;
    }
    if(numflag == true)
	  {
      switch(addreduce)
      {
        case "add_5":
          var value = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value + 5;
          break;
        case "add_10":
          var value = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value + 10;
          break;
        case "add_100":
          var value = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value + 100;
          break;
        case "reduce_5":
          var value = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value - 5;
          break;
        case "reduce_10":
          var value = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value - 10;
          break;
        case "reduce_100":
          var value = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = value - 100;
          break;
        case "resetmotor":
          var value = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = 2048;
          break;
        default:
          var getvalue = Number(document.getElementById('addvalue').value);
          var value = Number(document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value);
          document.getElementById('AbsolutePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[resetID].value = getvalue + value;
          break;
      }
      document.getElementById('label').innerHTML = "add & reduce is successful !!";
    }
    else
	  {
      if(Motorflag)
      {
        document.getElementById('label').innerHTML = "No this MotorID !!";
      }
      else
      {
        document.getElementById('label').innerHTML = "add & reduce is fail !! No this ID !!";
      }
    }
  }
}

function Multiple()
{
  var num=document.getElementById("chose_multiple").value;
  var times=document.getElementById("times").value;
  var n=0;
  var numflag=false;
  if(document.getElementById("MotionList").style.display == "initial")
  {
   
  }
  else if(document.getElementById("RelativePosition").style.display == "initial")
  {
    for(var i = 0; i < document.getElementById('RelativePositionTable').getElementsByTagName('div').length; i += 2)
	  {
      if(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value == num)
	    {
        n = i;
        numflag = true;
        break;
      }  
    }
    if(numflag == true)
	  {
      for (var j = 1; j <= 26; j++)
	    {
        var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[j].value);
        document.getElementById('RelativePositionTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[j].value = value * times;
      }
      document.getElementById('label').innerHTML = "Multiple is successful !!";
    }
    else
	  {
      document.getElementById('label').innerHTML = "Multiple is fail !! No this ID !!";
    }
  
  } 
  else if(document.getElementById("RelativeSpeed").style.display == "initial")
  {
    for(var i = 0; i<document.getElementById('RelativeSpeedTable').getElementsByTagName('div').length; i += 2)
	  {
      if(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value == num)
	    {
        n = i;
        numflag = true;
        break;
      }  
    }
    if(numflag==true)
	  {
      for (var j = 1; j <= 26; j++)
	    {
        var value = Number(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[j].value);
        document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[n+1].getElementsByClassName('textbox')[j].value = value * times;
      }
      document.getElementById('label').innerHTML = "Multiple is successful !!";
    }
    else
	  {
      document.getElementById('label').innerHTML = "Multiple is fail !! No this ID !!";
    }
  }  
  else if(document.getElementById("AbsolutePosition").style.display == "initial")
  {

  }
  else if(document.getElementById("AbsoluteSpeed").style.display ==  "initial")
  {

  }
}

function Merge(){
  var num1 = document.getElementById("Merge1").value;
  var num2 = document.getElementById("Merge2").value;
  var num1flag=false;
  var num2flag=false;
  var n1=0;
  var n2=0;
  if(document.getElementById("MotionList").style.display == "initial")
  {
   
  }
  else if(document.getElementById("RelativePosition").style.display == "initial" || document.getElementById("RelativeSpeed").style.display ==  "initial")
  {
    for(var i = 0;i < document.getElementById('RelativePositionTable').getElementsByTagName('div').length && num1 != num2; i += 2)
	  {
      if(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value == num1)
	    {
        n1 = i;
        num1flag = true;
      }
      if(document.getElementById('RelativePositionTable').getElementsByTagName('div')[i].getElementsByClassName('textbox')[0].value == num2)
	    {
        n2 = i;
        num2flag = true;
      }
      if(num1flag == true && num2flag == true)
      {
      break;
      }
    }
    if(num1flag == true && num2flag == true)
	  {
      for(var j = 1; j <= 26; j++)
	    {
        var value = Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n2+1].getElementsByClassName('textbox')[j].value);
        document.getElementById('RelativePositionTable').getElementsByTagName('div')[n2+1].getElementsByClassName('textbox')[j].value = value + Number(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n1+1].getElementsByClassName('textbox')[j].value);
        if(value != 0 && document.getElementById('RelativePositionTable').getElementsByTagName('div')[n2+1].getElementsByClassName('textbox')[j].value == 0)
        {
          document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[n2+1].getElementsByClassName('textbox')[j].value = 0;
        }
        else if(value == 0 && document.getElementById('RelativePositionTable').getElementsByTagName('div')[n2+1].getElementsByClassName('textbox')[j].value != 0 && document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[n2+1].getElementsByClassName('textbox')[j].value == 0)
        {
          document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[n2+1].getElementsByClassName('textbox')[j].value = 20;
        }
      }
      document.getElementById('RelativePositionTable').removeChild(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n1]);
      document.getElementById('RelativePositionTable').removeChild(document.getElementById('RelativePositionTable').getElementsByTagName('div')[n1]);
      document.getElementById('RelativeSpeedTable').removeChild(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[n1]);
      document.getElementById('RelativeSpeedTable').removeChild(document.getElementById('RelativeSpeedTable').getElementsByTagName('div')[n1]);
      document.getElementById('label').innerHTML = "Merge is successful !!";
    }
    else
	  {
      if(num1 == num2)
      {
        document.getElementById('label').innerHTML = "ID1 can't be the same as ID2 !!";
      }
      else if(num1flag == false && num2flag == true)
      {
        document.getElementById('label').innerHTML = "Merge is fail !! No ID1 !!";
      }
      else if(num1flag == true && num2flag == false)
      {
        document.getElementById('label').innerHTML = "Merge is fail !! No ID2 !!";
      }
      else if(num1flag == false && num2flag == false)
      {
        document.getElementById('label').innerHTML = "Merge is fail !! No both ID !!";
      }
    }
  }  
  else if(document.getElementById("AbsolutePosition").style.display == "initial" || document.getElementById("AbsoluteSpeed").style.display ==  "initial")
  {
    
  }
}

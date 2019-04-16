//所有页面
function submit_link(button) {
    var a=button.getElementsByTagName("a")[0];
    a.click();
}
function emailMessage() {
    swal("尚未开发，敬请期待！","亲，不要着急哦！","info");
}
function logOut(a) {
    swal({
        title: "确定要注销吗？",
        text: "注销后需要重新登录才能访问此页！",
        type: "warning",
        showCancelButton: true,
        cancelButtonText:"取消",
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确定",
        closeOnConfirm: false
    },function (isConfirm) {
        if(isConfirm){
            swal("注销成功", "即将返回至登录页面", "success");
            a.href="/login/adminLogOut";
            a.click();
        }
    });
}
//导出报表页面
//用来控制显示的列表
window.onload=function () {
    let month=new Date().getMonth()+1;//获得当前月
    if(month>8||month===1){//上学期
        $(".col_3_down").hide();//隐藏下学期的列表
        let length=$(".col_3_up").children("div").length-1;//获得月份个数
        for(let i=9;i<length+9;i++){//进行循环
            let name="#month_"+i;   //拼接月份div的id
            let button=name+" .exportButton";   //拼接当月下的button的class
            let value=$(button)[0].value;   //获得第一个按钮的值，即月份
            if(month===1){  //如果月份为1，则改写成13
                month=13;
            }
            if(value==1){//如果是1月，则把值改为13（传输后台的数据仍然为1），用==进行比较，因为类型可能不匹配
                value=13;
            }
            if(value<=month){  //控制显示的列表，只显示当月之前的列表，其它隐藏
                $(name).show();
            }else{
                $(name).hide();
            }
        }
    }else{ //下学期
        $(".col_3_up").hide();
        let length=$(".col_3_down").children("div").length-1;
        for(let i=2;i<length+2;i++){
            let name="#month_"+i;
            let button=name+" .exportButton";
            let value=$(button)[0].value;
            if(value<=month){
                $(name).show();
            }else{
                $(name).hide();
            }
        }
    }
};
//用来向后台传输月份，以及将返回的数据进行拼接导出
$(".exportButton").click(function(){
    let value=this.value;
    $.ajax({
        //提交数据的类型 POST GET
        type:"POST",
        //提交的网址
        url:"/json/export",
        //提交的数据
        data:{month:this.value},
        //返回数据的格式
        datatype: "json",
        //成功返回之后调用的函数
        success:function (data){
            //列标题，逗号隔开，每一个逗号就是隔开一个单元格
            let str = `姓名`;
            //将日期添加进字符串
            //首先获得月份，判断当月有多少天
            let year=new Date().getFullYear();//2019
            let month=value;//月份是从0开始，所以需要+1
            let days=[0]; //声明数组，存放具体天数,数组中的0主要为了占位，循环时匹配姓名列
            if(["1","3","5","7","8","10","12"].includes(month)){//31天
                for(let i=1;i<=31;i++){
                    str+=`,`+month+`-`+i; //,3.20
                    days.push(month+`-`+i);//将具体日期放在数组中 3,20
                }
                str+=`\n`; //换行，准备输出数据
            }else if(["4","6","9","11"].includes(month)){//30天
                for(let i=1;i<=30;i++){
                    str+=`,`+month+`-`+i;
                    days.push(month+`-`+i);
                }
                str+=`\n`;
            }else if( year%4===0 && year%100!==0 || year%400===0){//闰年2月29天
                for(let i=1;i<=29;i++){
                    str+=`,`+month+`-`+i;
                    days.push(month+`-`+i);
                }
                str+=`\n`;
            }else{ //平年2月28天
                for(let i=1;i<=28;i++){
                    str+=`,`+month+`-`+i;
                    days.push(month+`-`+i);
                }
                str+=`\n`;
            }
            //将数据添加进表格，判断签到日期是否匹配
            //增加\t为了不让表格显示科学计数法或者其他格式
            for(let i = 0 ; i < data.length ; i++ ){//遍历次数为总人数
                let isName=true;    //用来标识每一行的姓名列，isName=true说明是每一行的第一列
                for(let k=0; k<days.length; k++){//遍历次数为每个月的天数
                    //days数据类型：0,1,2,3,4,5,6,7,8,......
                    let isWrite=false;  //用来标识是否对表格进行了写入
                    for(let item in data[i]){//遍历次数为每个人的数据长度
                        //jsonData数据类型：张三，3-1，3-2 ......
                        if(isName===true){  //第一次进入循环直接将姓名进行拼接
                            str+=`${data[i][item] + '\t'},`;//写入名字
                            isName=false;
                            isWrite=true;
                            break;
                        }else{      //从第二次开始检查日期是否匹配，如果匹配则写入内容跳出循环
                            if(days[k]===data[i][item]){
                                str+=`${`√` + '\t'},`;//打上对勾
                                isWrite=true;
                                break;
                            }else{  //如果不匹配进行下一次比较，直至完成
                                isWrite=false;
                            }
                        }
                    }
                    //完成所有匹配后判断是否写入内容，如果没有则用空白填充
                    if(isWrite===false){
                        str+=`${` ` + '\t'},`;//空白填充
                    }
                }
                str+='\n';
            }
            //encodeURIComponent解决中文乱码
            let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
            //通过创建a标签实现
            let link = document.createElement("a");
            link.href = uri;
            //对下载的文件命名
            link.download = month+ "月份签到表.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        //调用出错执行的函数
        error: function(error){
            alert("ajax error : "+error);
        }
    });
});
const users=[];

function userJoin(username, id){
    let user = {username, id};
    users.push(user);
    return users;
}

function delUser(id){

    var ind = users.findIndex((user)=>user.id===id);
    if(ind !== -1){
     users.splice(ind,1);
       return users;
    }
}

function _delUser(id){
    
    var ind = users.findIndex((user)=>user.id===id);
    var left_user = users[ind].username;
    return left_user;
}
function noOfUser(){
    let len = users.length;
    return (len);
}


module.exports = {userJoin, delUser , _delUser, noOfUser};
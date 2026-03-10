const generateSeats=(totalSeat)=> {
    if(totalSeat<6){
        return null
    }
    const seats=[];
    const letters=["A","B","C","D","E","F"];
    for(let row=1;row<=totalSeat/6;row++){
        let seatClass;
        let price;
        if(row<=5){
            seatClass="First Class";
            price=2000000;
        }
        else if(row<=10){
            seatClass="Business";
            price=1500000;
        }
        else {
            seatClass="Economy"
            price=800000
        }
        for(const letter of letters){
            seats.push({
                seatCode:`${row}${letter}`,
                class : seatClass,
                price: price
            })
        }
    }
    return seats;
}
module.exports=generateSeats
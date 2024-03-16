import prisma from "@/lib/prisma";

export async function updateDatabase() {
  const percentageData = await prisma.percentage.findMany();
  const btcPriceData = await prisma.cryptoPrices.findMany();
  // for (const btc of btcPriceData) {
  //   if (
  //     percentageData.some((percentage) => {
  //       let timestamp_sec = Math.round(percentage.createdAt!.getTime() / 1000);
  //       let rounded_timestamp_sec = timestamp_sec - (timestamp_sec % 60);
  //       let rounded_timestamp_ms = rounded_timestamp_sec * 1000;
  //       let rounded_time = new Date(rounded_timestamp_ms).toUTCString();

  //       let timestamp_sec2 = Math.round(btc.updateAt.getTime() / 1000);
  //       let rounded_timestamp_sec2 = timestamp_sec2 - (timestamp_sec2 % 60);
  //       let rounded_timestamp_ms2 = rounded_timestamp_sec2 * 1000;
  //       let rounded_time2 = new Date(rounded_timestamp_ms2).toUTCString();
  //       return rounded_time === rounded_time2;
  //     })
  //   ) {
  //     continue;
  //   } else {
  //     let timestamp_sec = Math.round(btc.updateAt.getTime() / 1000);
  //     let rounded_timestamp_sec = timestamp_sec - (timestamp_sec % 60);
  //     let rounded_timestamp_ms = rounded_timestamp_sec * 1000;
  //     let rounded_time = new Date(rounded_timestamp_ms).toUTCString();
  //     console.log(rounded_time);
  //     await prisma.cryptoPrices.delete({
  //       where: { id: btc.id },
  //     });
  //   }
  // }
  let count = 0;
  for (const perc of percentageData) {
    if (
      btcPriceData.some((btc) => {
        let timestamp_sec = Math.round(btc.updateAt.getTime() / 1000);
        let rounded_timestamp_sec = timestamp_sec - (timestamp_sec % 60);
        let rounded_timestamp_ms = rounded_timestamp_sec * 1000;
        let rounded_time = new Date(rounded_timestamp_ms).toUTCString();

        let timestamp_sec2 = Math.round(perc.createdAt!.getTime() / 1000);
        let rounded_timestamp_sec2 = timestamp_sec2 - (timestamp_sec2 % 60);
        let rounded_timestamp_ms2 = rounded_timestamp_sec2 * 1000;
        let rounded_time2 = new Date(rounded_timestamp_ms2).toUTCString();
        return rounded_time === rounded_time2;
      })
    ) {
      continue;
    } else {
      count++;
      let timestamp_sec = Math.round(perc.createdAt!.getTime() / 1000);
      let rounded_timestamp_sec = timestamp_sec - (timestamp_sec % 60);
      let rounded_timestamp_ms = rounded_timestamp_sec * 1000;
      let rounded_time = new Date(rounded_timestamp_ms).toUTCString();
      console.log(rounded_time, count);
      await prisma.percentage.delete({
        where: { id: perc.id },
      });
    }
  }
}

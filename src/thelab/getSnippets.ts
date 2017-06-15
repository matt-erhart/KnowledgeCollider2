import { storageRef, dbRef } from "../redux/configureStore";
import * as _ from "lodash";
import * as Rx from "rxjs";

interface snippet {
  comment: string;
  created: string;
  imgPath: string;
  snippettitle: string;
  url: string;
  downloadUrl?: any; //of the image.
  id?: string;
}

let snippets = dbRef.ref("snippets").orderByKey().once("value");

let snippets$ = Rx.Observable
  .fromPromise(snippets)
  .map(snapshot => {
    let data: snippet[] = [];
    snapshot.forEach(dbItem => {
      let val = dbItem.val();
      val.id = dbItem.key;
      val.downloadUrl = storageRef.child(val.imgPath).getDownloadURL();
      data.push(val);
    });
    return data;
  })
  .mergeMap(
    data => Promise.all(_.map(data, d => d.downloadUrl)),
    (data, urls) => {
      data.forEach((d, i) => data[i].downloadUrl = urls[i]); //overwrite promise with return value
      return data
    }
  );

export default snippets$;

// export default async function() {
//   var snapshot = await query.once("value");
//   let snapShots = [];
//   let imgUrls = [];
//   for await (let snap of snapshot) {
//     var key = snap.key;
//     var data: snippet = snap.val();
//     storageRef.child(data.imgPath).getDownloadURL().then(downloadUrl => {
//       data.downloadUrl = downloadUrl;
//       snapShots.push(data);
//     });
//   }

//   return await snapShots;
// }

// _.forEach(this.props.snippets, (snip,key) => {
//         if (!_.includes(_.keys(this.state.imgSrcs), key)){
//           console.log('snip', snip, key)
//           const ref = storageRef.child(snip.imgPath);
//             ref.getDownloadURL().then((url) => {
//             this.setState({imgSrcs: {...this.state.imgSrcs, [key]: url}})
//           });
//         }
//       })

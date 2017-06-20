import { storageRef, dbRef } from "../redux/configureStore";
import * as _ from "lodash";
import * as Rx from "rxjs";


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
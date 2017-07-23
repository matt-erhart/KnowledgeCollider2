import * as React from "react";
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText
} from "material-ui/Card";
import FlatButton from "material-ui/FlatButton";
import Toggle from "material-ui/Toggle";

interface props {
  snippet: snippet;
}

export default class CardExampleControlled extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      downloadUrl,
      user,
      project,
      purpose,
      created,
      url,
      title,
      snippet,
      comment
    } = this.props.snippet;
    return (
      <Card>
        <CardHeader
          title={`${user}/${project}/${purpose}/${title}`}
          subtitle={`${comment} | ${snippet}`}
          actAsExpander={true}
          showExpandableButton={true}
          avatar={
            <img
              onClick={() => this.props.handleImgClick(this.props.snippet)}
              src={downloadUrl}
              style={{
                maxWidth: "100px",
                maxHeight: "200px"
              }}
            />
          }
        />

        <CardText expandable={true} actAsExpander={true}>
          <CardMedia expandable={true} overlay={<CardTitle title={created} />}>
            <img src={this.props.snippet.downloadUrl} />
          </CardMedia>
          {snippet}
        </CardText>
        {/* <CardActions>
          <FlatButton label="Expand" onTouchTap={this.handleExpand} />
          <FlatButton label="Reduce" onTouchTap={this.handleReduce} />
        </CardActions> */}
      </Card>
    );
  }
}

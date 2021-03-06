import * as React from "react";
import { storageRef, dbRef } from "../../redux/configureStore";

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
import TextField from "material-ui/TextField";
import * as _ from "lodash";
interface props {
  snippet: snippet;
}

export const HoverCard = props => {
  return (
    <div style={{width: '500px', backgroundColor: 'WhiteSmoke', borderColor: 'black', zIndex: 999, pointerEvents: 'none', padding: '10px'}}>
      <b style={{ color: "#7EB6FF" }}> Snippet: </b>
      {props.snippet.snippet} / {props.snippet.created}
      <hr />
      <img
        src={props.snippet.imgUrl}
        style={{ maxWidth: 500, maxHeight: 500 }}
      />
    </div>
  );
};

const Subtitle = props => {
  return (
    <div>
      <span>
        <b style={{ color: "#7EB6FF" }}>Comment: </b>{" "}
        {props.snippet.comment || "None"}{" "}
      </span>
      <div>
        <b style={{ color: "#7EB6FF" }}> Snippet: </b>
        {props.snippet.snippet}
      </div>
      <div>
        {" "}{props.snippet.created}{" "}
      </div>
      <FlatButton
        backgroundColor="WhiteSmoke"
        hoverColor="#0080ff"
        label="Attach to text"
        onTouchTap={e => {
          e.stopPropagation();
          props.handleAttachEntity(props.snippet);
        }}
      />
      <FlatButton
        style={{ marginLeft: "5px" }}
        backgroundColor="WhiteSmoke"
        hoverColor="#0080ff"
        label="Go to Source"
        href={props.snippet.url}
        target="_blank"
        onTouchTap={e => {
          e.stopPropagation();
        }}
      />
    </div>
  );
};

export default class CardExampleControlled extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      snippet: this.props.snippet
    };
  }

  render() {
    const {
      imageUrl,
      thumbUrl,
      user,
      project,
      purpose,
      created,
      url,
      title,
      snippet,
      comment,
      deleteSnippet,
      id
    } = this.state.snippet;

    return (
      <Card
        expanded={this.state.expanded}
        onExpandChange={() => this.setState({ expanded: !this.state.expanded })}
      >
        <CardHeader
          title={`${user}/${project}/${purpose}/${title}`}
          subtitle={
            <Subtitle
              snippet={this.props.snippet}
              handleAttachEntity={this.props.handleAttachEntity}
            />
          }
          actAsExpander={true}
          showExpandableButton={true}
          avatar={
            <img
              onClick={e => {
                e.stopPropagation();
                this.props.handleImgClick(this.props.snippet);
              }}
              src={thumbUrl}
              style={{
                maxWidth: "100px",
                maxHeight: "200px"
              }}
            />
          }
        />
        <CardText expandable={true}>
          <FlatButton
            label={"Delete Snippet"}
            backgroundColor="orange"
            hoverColor="red"
            onClick={() => {
              this.props.deleteSnippet(id);
              this.setState({ expanded: false });
            }}
          />
          {_.map(this.state.snippet, (val, key) => {
            return (
              <TextField
                key={key}
                value={this.state.snippet[key]}
                onChange={e => {
                  const edited = {
                    ...this.state.snippet,
                    [key]: (e.target as any).value
                  };
                  this.setState({ snippet: edited });
                }}
                floatingLabelText={key}
                multiLine={true}
                fullWidth={true}
              />
            );
          })}
          <FlatButton
            label={"Save edits"}
            backgroundColor="silver"
            hoverColor="#0080ff"
            onClick={e => {
              let { id, ...snippet } = this.state.snippet;
              dbRef.ref().child("snippets/" + id).update(snippet);
            }}
          />
        </CardText>
      </Card>
    );
  }
}

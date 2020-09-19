import React, {
  useState
} from 'react';
import type {
  ChangeEvent,
  FC,
  KeyboardEvent
} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Avatar,
  Divider,
  IconButton,
  Input,
  Paper,
  SvgIcon,
  Tooltip,
  makeStyles
} from '@material-ui/core';
import { Send as SendIcon } from 'react-feather';
import useAuth from '../../hooks/useAuth';

interface MessageComposerProps {
  className?: string;
  disabled?: boolean;
  onSend?: (value: string) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    padding: theme.spacing(1, 2)
  },
  inputContainer: {
    flexGrow: 1,
    marginLeft: theme.spacing(2),
    padding: theme.spacing(1)
  },
  divider: {
    height: 24,
    width: 1
  },
  fileInput: {
    display: 'none'
  }
}));

const MessageComposer: FC<MessageComposerProps> = ({
  className,
  disabled,
  onSend,
  ...rest
}) => {
  const classes = useStyles();
  const user = useAuth();
  const [body, setBody] = useState<string>('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    setBody(event.target.value);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.keyCode === 13) {
      handleSend();
    }
  };

  const handleSend = (): void => {
    if (!body) {
      return;
    }

    if (onSend) {
      onSend(body);
    }

    setBody('');
  };

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Avatar
        alt="Person"
        src={user.avatar}
      />
      <Paper
        variant="outlined"
        className={classes.inputContainer}
      >
        <Input
          disableUnderline
          fullWidth
          value={body}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          placeholder="Leave a message"
          disabled={disabled}
        />
      </Paper>
      <Divider className={classes.divider} />
      <Tooltip title="Send">
        <span>
          <IconButton
            color="secondary"
            disabled={!body || disabled}
            onClick={handleSend}
          >
            <SvgIcon fontSize="small">
              <SendIcon />
            </SvgIcon>
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};

MessageComposer.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onSend: PropTypes.func
};

MessageComposer.defaultProps = {
  disabled: false,
  onSend: () => {}
};

export default MessageComposer;

import {
  AttributesInput,
  Button,
  Checkbox,
  FormInput,
  RadioGroup,
  TextArea,
  TextInput
} from '../ui';
import { CreateTokenSchema, TokenType, YouTubeVideo } from '@fanbase/shared';
import { Field, Form, Formik, FormikProps } from 'formik';
import React, { useState } from 'react';
import YouTubeVideoList, {
  YouTubeVideoRow
} from '../components/YouTubeVideoList';

import ApiClient from '../modules/api/ApiClient';
import Head from 'next/head';
import MediaUploader from '../components/MediaUploader';
import Modal from '../ui/Modal';
import { RadioOption } from '../ui/RadioGroup';
import { getTokenUrl } from '../utils';
import styles from '../styles/CreateToken.module.scss';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import { useRouter } from 'next/router';

export default function CreateTokenPage() {
  useHeader();

  useAuthentication(true);

  const router = useRouter();

  const tokenTypesOptions: {
    [key: string]: RadioOption;
  } = {
    BASIC: {
      id: TokenType.BASIC,
      label: 'Basic'
    },
    YT_VIDEO: {
      id: TokenType.YT_VIDEO,
      label: 'YouTube Video'
    }
  };

  const [tokenType, setTokenType] = useState<RadioOption>(
    tokenTypesOptions.BASIC
  );

  const [youTubeVideo, setYouTubeVideo] = useState<YouTubeVideo>(null);
  const [showYouTubeVideos, setShowYouTubeVideo] = useState(false);
  const [youTubeVideosClosing, setYouTubeVideosClosing] = useState(false);

  const [hasRoyalties, setHasRoyalties] = useState(true);
  const [hasAttributes, setHasAttributes] = useState(false);

  const [isUploading, setUploading] = useState(false);

  const [created, setCreated] = useState(false);

  return (
    <div className="container boxed">
      <Head>
        <title>Create new token</title>
      </Head>
      <Formik
        initialValues={{
          type: tokenType.id,
          name: '',
          supply: 1,
          royaltyPercentage: 10
        }}
        validationSchema={CreateTokenSchema}
        onSubmit={async (values) => {
          const token = await ApiClient.instance?.createToken({
            type: values.type,
            resource: values.resource,
            name: values.name,
            description: values.description,
            image: values.image,
            supply: values.supply,
            royaltyPct: values.royaltyPercentage,
            attributes: values.attributes
          });

          setCreated(true);

          router.push(getTokenUrl(null, token));
        }}
      >
        {({
          values,
          handleChange,
          setFieldValue,
          setFieldTouched,
          isValid,
          dirty,
          errors,
          isSubmitting
        }: FormikProps<any>) => (
          <Form className={styles.createTokenForm}>
            <h2>Create a new token</h2>

            <FormInput label="Token type">
              <RadioGroup
                category="token-type"
                options={Object.values(tokenTypesOptions)}
                selected={tokenType}
                onSelect={(option: RadioOption) => {
                  setTokenType(option);
                  setFieldValue('type', option.id);
                }}
              />
            </FormInput>

            {values.type == tokenTypesOptions.YT_VIDEO.id && (
              <div className={styles.ytVideoSelection}>
                {youTubeVideo ? (
                  <YouTubeVideoRow
                    video={youTubeVideo}
                    selected
                    onClick={() => {
                      setShowYouTubeVideo(true);
                    }}
                  />
                ) : (
                  <Button
                    type="button"
                    size="small"
                    onClick={() => {
                      setShowYouTubeVideo(true);
                    }}
                  >
                    Select Video
                  </Button>
                )}
              </div>
            )}

            <Modal
              show={showYouTubeVideos}
              closing={youTubeVideosClosing}
              requestClose={() => {
                setYouTubeVideosClosing(true);
                setTimeout(() => {
                  setYouTubeVideosClosing(false);
                  setShowYouTubeVideo(false);
                }, 300);
              }}
            >
              <YouTubeVideoList
                onSelected={(video: YouTubeVideo) => {
                  setYouTubeVideo(video);

                  setFieldValue('name', video.title, true);
                  setFieldValue('description', video.description);
                  setFieldValue('resource', video.id);

                  setTimeout(() => setFieldTouched('name', true));

                  setYouTubeVideosClosing(true);

                  setTimeout(() => {
                    setYouTubeVideosClosing(false);
                    setShowYouTubeVideo(false);
                  }, 300);
                }}
              />
            </Modal>

            {values.type == tokenTypesOptions.BASIC.id && (
              <FormInput label="Image" optional>
                <MediaUploader
                  onRead={async (file: File) => {
                    try {
                      const response =
                        await ApiClient.instance.getTokenImageUploadUrl(
                          file.name,
                          file.type,
                          file.size
                        );

                      setFieldValue('image', response.url);

                      setUploading(true);

                      await ApiClient.instance.uploadImageToS3(
                        response.signedUrl,
                        file
                      );
                    } catch (err) {
                      console.log(err);
                    }

                    setUploading(false);
                  }}
                />
              </FormInput>
            )}

            <FormInput label="Name" error={errors.name as string}>
              <Field
                id="name"
                name="name"
                placeholder="My first video"
                component={TextInput}
                value={values.name}
                onChange={handleChange}
              />
            </FormInput>

            <FormInput label="Description">
              <Field
                id="description"
                name="description"
                placeholder="This was the first ever video I posted on YouTube"
                component={TextArea}
                value={values.description}
                onChange={handleChange}
              />
            </FormInput>

            <div className="two-col">
              <FormInput
                label="Supply"
                description="Either create an exclusive token or multiple ones."
                error={errors.supply as string}
              >
                <Field
                  type="number"
                  id="supply"
                  name="supply"
                  placeholder="1"
                  min="0"
                  max="999999"
                  component={TextInput}
                  value={values.supply}
                  onChange={handleChange}
                />
              </FormInput>

              <div className="create-token__royalties">
                <FormInput
                  label="Royalties"
                  description="The percentage you receive on each sale."
                  error={errors.royaltyPercentage as string}
                >
                  {/* <FormInput
                      label="Royalties"
                      description={
                        !hasRoyalties
                          ? "Receive a percentage on each sale."
                          : null
                      }
                    >
                      <Checkbox
                        id="has-royalties"
                        label="Earn royalties"
                        checked={hasRoyalties}
                        onChange={() => {
                          setHasRoyalties(!hasRoyalties);
                        }}
                      /> */}

                  {hasRoyalties && (
                    <FormInput>
                      <Field
                        type="number"
                        id="royaltyPercentage"
                        name="royaltyPercentage"
                        placeholder="10"
                        min="0"
                        max="100"
                        component={TextInput}
                        value={values.royaltyPercentage}
                        onChange={handleChange}
                      />
                    </FormInput>
                  )}
                </FormInput>
              </div>
            </div>
            <div className="create-token__attrs">
              <FormInput
                label="Attributes"
                optional
                description={
                  !hasAttributes
                    ? 'Things like colour, level, rarity, etc.'
                    : null
                }
              >
                <Checkbox
                  id="has-attributes"
                  label="Has attributes"
                  checked={hasAttributes}
                  onChange={() => {
                    setHasAttributes(!hasAttributes);
                  }}
                />
              </FormInput>

              {hasAttributes && (
                <div style={{ marginTop: 10 }}>
                  <AttributesInput
                    onChange={(attrs) => {
                      setFieldValue('attributes', attrs);
                    }}
                  />
                </div>
              )}
            </div>

            <div className={styles.createTokenFormActions}>
              <Button
                type="submit"
                color="primary"
                loading={isUploading || isSubmitting}
                disabled={!dirty || !isValid || created}
              >
                Create
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
